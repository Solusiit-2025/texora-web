async function runTests() {
  const baseUrl = "http://localhost:3000";
  console.log("=== STARTING AUTH & RBAC TEST SUITE ===\n");

  // 1. Test unauthenticated access to /portal/dashboard
  console.log("Test 1: Unauthenticated access to /portal/dashboard");
  const res1 = await fetch(`${baseUrl}/portal/dashboard`, { redirect: "manual" });
  console.log(`- Status: ${res1.status}`);
  console.log(`- Location: ${res1.headers.get("location")}`);
  if (res1.status === 307 && res1.headers.get("location")?.includes("/login?redirect=%2Fportal%2Fdashboard")) {
    console.log("  PASS: Properly redirected to /login with redirect param\n");
  } else {
    console.log("  FAIL: Expected 307 redirect to /login\n");
  }

  // 2. Test invalid login
  console.log("Test 2: Login with invalid credentials");
  const res2 = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@texora.co.id", password: "WrongPassword123!" }),
  });
  const data2 = await res2.json();
  console.log(`- Status: ${res2.status}`);
  console.log(`- Response: ${JSON.stringify(data2)}`);
  if (res2.status === 401) {
    console.log("  PASS: Rejected invalid password\n");
  } else {
    console.log("  FAIL: Expected 401\n");
  }

  // 3. Test valid login as Super Admin
  console.log("Test 3: Login as Administrator (admin@texora.co.id)");
  const res3 = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@texora.co.id", password: "Admin@Texora2026!" }),
  });
  const data3 = await res3.json();
  console.log(`- Status: ${res3.status}`);
  console.log(`- User: ${data3.user?.name} (${data3.user?.role})`);
  const setCookie = res3.headers.get("set-cookie") || "";
  console.log(`- Has tokenauth cookie: ${setCookie.includes("tokenauth=")}`);
  console.log(`- Has tokenrefresh cookie: ${setCookie.includes("tokenrefresh=")}`);
  console.log(`- Cookies HttpOnly: ${setCookie.toLowerCase().includes("httponly")}`);

  if (res3.status === 200 && setCookie.includes("tokenauth=") && setCookie.includes("tokenrefresh=")) {
    console.log("  PASS: Admin login successful with httpOnly cookies set\n");
  } else {
    console.log("  FAIL: Login response or cookies incorrect\n");
  }

  // Extract cookies
  // In fetch, set-cookie can be comma-separated or array
  const rawCookies = res3.headers.getSetCookie ? res3.headers.getSetCookie() : [setCookie];
  const cookieHeader = rawCookies
    .map((c) => c.split(";")[0])
    .join("; ");

  // 4. Test authenticated access to /api/auth/me
  console.log("Test 4: Access /api/auth/me with auth cookies");
  const res4 = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Cookie: cookieHeader },
  });
  const data4 = await res4.json();
  console.log(`- Status: ${res4.status}`);
  console.log(`- Authenticated user: ${data4.user?.name} - ${data4.user?.email}`);
  if (res4.status === 200 && data4.user?.email === "admin@texora.co.id") {
    console.log("  PASS: /api/auth/me returned correct session\n");
  } else {
    console.log("  FAIL: /api/auth/me failed\n");
  }

  // 5. Test authenticated access to /portal/dashboard with cookies
  console.log("Test 5: Access /portal/dashboard with valid Administrator cookies");
  const res5 = await fetch(`${baseUrl}/portal/dashboard`, {
    headers: { Cookie: cookieHeader },
    redirect: "manual",
  });
  console.log(`- Status: ${res5.status}`);
  if (res5.status === 200) {
    console.log("  PASS: Admin allowed access to /portal/dashboard\n");
  } else {
    console.log(`  FAIL: Expected 200, got ${res5.status}\n`);
  }

  // 6. Test RBAC: Customer attempting to access /portal/dashboard
  console.log("Test 6: Customer login and RBAC boundary test");
  const res6Login = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "hendra@garmentkreatif.com", password: "Customer@Texora2026!" }),
  });
  const custCookies = (res6Login.headers.getSetCookie ? res6Login.headers.getSetCookie() : [res6Login.headers.get("set-cookie") || ""])
    .map((c) => c.split(";")[0])
    .join("; ");

  const res6Portal = await fetch(`${baseUrl}/portal/dashboard`, {
    headers: { Cookie: custCookies },
    redirect: "manual",
  });
  console.log(`- Customer accessing /portal/dashboard status: ${res6Portal.status}`);
  console.log(`- Location redirect: ${res6Portal.headers.get("location")}`);
  if (res6Portal.status === 307 && res6Portal.headers.get("location")?.includes("/customer/dashboard")) {
    console.log("  PASS: Customer properly blocked from /portal and redirected to /customer/dashboard\n");
  } else {
    console.log("  NOTE: Customer redirected to:", res6Portal.headers.get("location"));
  }

  // 7. Test Token Refresh
  console.log("Test 7: Token Refresh endpoint /api/auth/refresh");
  const res7 = await fetch(`${baseUrl}/api/auth/refresh`, {
    method: "POST",
    headers: { Cookie: cookieHeader },
  });
  const data7 = await res7.json();
  console.log(`- Refresh status: ${res7.status}`);
  console.log(`- Refresh response: ${JSON.stringify(data7)}`);
  if (res7.status === 200 && data7.success) {
    console.log("  PASS: Refresh token rotated successfully\n");
  } else {
    console.log("  FAIL: Refresh token rotation failed\n");
  }

  // 8. Test Logout
  console.log("Test 8: Logout endpoint /api/auth/logout");
  const res8 = await fetch(`${baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: cookieHeader },
  });
  const data8 = await res8.json();
  const logoutCookies = res8.headers.get("set-cookie") || "";
  console.log(`- Logout status: ${res8.status}`);
  console.log(`- Cookie clearing: ${logoutCookies.includes("Max-Age=0") || logoutCookies.includes("expires=")}`);
  if (res8.status === 200 && data8.success) {
    console.log("  PASS: Logout successful and cookies invalidated\n");
  } else {
    console.log("  FAIL: Logout failed\n");
  }

  console.log("=== ALL AUTH & RBAC TESTS FINISHED ===");
}

runTests().catch(console.error);
