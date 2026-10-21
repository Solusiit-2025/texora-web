import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Data terjemahan akurat & profesional untuk 5 bahasa:
// en: English
// zh: 简体中文 (Simplified Chinese)
// ja: 日本語 (Japanese)
// de: Deutsch (German)
// ar: العربية (Arabic)

const PRODUCT_TRANSLATIONS = {
  "dryfit-milano-premium": {
    en: "Fine-point knit fabric engineered for optimal air circulation. Formulated specifically for deep-shade dye-sublimation ink absorption, colorfastness, and rapid moisture-wicking. The industry benchmark for football, cycling, and running team jerseys.",
    zh: "高透气细网眼针织面料，专为深色热升华墨水吸收、防掉色及快速吸湿排汗配方。足球、自行车与跑步队服的首选专业面料。",
    ja: "微細なドット構造の編み地で、優れた通気性を実現。昇華転写インクの高い発色性と耐洗濯性、吸汗速乾性を備えたスポーツウェア用高機能ポリエステル生地です。",
    de: "Fein strukturierter Strickstoff mit maximaler Belüftung. Speziell entwickelt für intensive Sublimationsfarbaufnahme, Waschbeständigkeit und Schnelltrocknung (Quick-Dry). Erste Wahl für Fußball-, Radsport- und Lauftrikots.",
    ar: "نسيج محبوك بنقاط دقيقة لتهوية مثالية. تركيبة خاصة لامتصاص حبر التسامي بالألوان العميقة، مقاوم للبهتان وسريع الجفاف. الخيار الأول لقمصان كرة القدم وركوب الدراجات والجري."
  },
  "dryfit-brazil-wave": {
    en: "Premium micro-hexagonal knit jersey fabric. Exceptionally flexible, lightweight, and delivers a cooling touch during intense physical exertion. The standard for professional esports, motocross, and basketball jerseys.",
    zh: "高级微六角蜂窝针织球衣面料。弹力优异、轻盈透气，出汗时触感清凉。职业电竞战队、越野摩托及篮球运动球衣的行业标杆。",
    ja: "微細な六角形ハニカム構造のプレミアムジャージ素材。高い伸縮性と軽量性を誇り、発汗時も肌離れの良いクーリングタッチを提供します。eスポーツやモトクロス、バスケ用ユニフォームに最適です。",
    de: "Premium-Jerseystoff mit elastischer Mikro-Wabenstruktur. Extrem flexibel, leicht und angenehm kühlend auf der Haut. Der Standard für professionelle E-Sport-, Motocross- und Basketballtrikots.",
    ar: "قماش جيرسي فاخر بنمط سداسي دقيق ومرن. خفيف الوزن ويوفر إحساساً منعشاً ومبرداً أثناء التعرق. المعيار لفرق الرياضات الإلكترونية والموتوكروس وكرة السلة."
  },
  "drifit-polymesh-pro": {
    en: "High-tensile micro-mesh fabric engineered for zone ventilation (underarms, back panels, and athletic side trims). Delivers instantaneous body heat dissipation with superior laundering durability.",
    zh: "高抗拉强度微孔透气网布，专为局部通风区域（腋下、后背及侧腰）设计。能瞬间散发体表湿热，耐磨耐洗。",
    ja: "高強度マイクロメッシュ生地。脇下、背中、サイドパネルなどのベンチレーションゾーンに最適で、熱気を素早く逃がし、激しい洗濯にも耐えうる耐久性を誇ります。",
    de: "Reißfestes Mikro-Mesh-Gewebe für gezielte Belüftungszonen (Achseln, Rücken und Seiteneinsätze). Leitet Körperwärme sofort ab und garantiert höchste Waschbeständigkeit.",
    ar: "نسيج شبكي دقيق عالي المتانة لمناطق التهوية الرياضية (تحت الإبط والظهر والجوانب). ينقل حرارة الجسم ورطوبته على الفور مع مقاومة فائقة للغسيل المتكرر."
  },
  "scuba-neoprene-stretch-heavy": {
    en: "Heavyweight double-knit scuba fabric with firm 4-way stretch. Crease-resistant, opaque, and delivers bold structural embossing under rotary heat press. Popular for bomber jackets, structural skirts, and luxury cushion covers.",
    zh: "重磅双面潜水面料（Scuba Neoprene），结构挺括且具备弹性。抗皱防透，热压后印花边缘极其锐利。常用于飞行员夹克、廓形裙装及高端家居靠垫。",
    ja: "しっかりとしたハリと伸縮性を兼ね備えた重厚な両面編みスキューバ素材。防シワ・非透過で、熱プレス時に立体感のあるプリントを実現。ボンバージャケットやクッションカバーに人気です。",
    de: "Schweres doppelt gestricktes Scuba-Gewebe mit fester Elastizität. Knitterfrei, blickdicht und formstabil beim Thermotransfer. Ideal für Bomberjacken, strukturierte Röcke und Premium-Kissen.",
    ar: "قماش سكوبا مزدوج الحياكة سميك ومرن بقوام قوي. مقاوم للتجعد وغير شفاف ويعطي تفاصيل واضحة عند الطباعة الحرارية. مثالي لجاكيتات البومبر والأزياء والوسائد الفاخرة."
  },
  "spandex-lycra-athletic": {
    en: "Resilient 4-way stretch fabric with superior shape recovery. Chlorine-resistant and UV-protective with a dense non-sheer knit that remains opaque when stretched. Chosen by manufacturers of swimwear, yoga leggings, and athletic compression apparel.",
    zh: "强韧四向弹力面料，回弹性极佳。抗氯耐紫外线，面料紧实致密，拉伸不透肉、不露白。广泛用于泳衣、瑜伽打底裤及运动压缩衣。",
    ja: "優れた復元力を備えた4WAYストレッチ生地。塩素や紫外線に強く、生地を伸ばしても透けない高密度編み。水着やヨガレギンス、コンプレッションウェアに最適です。",
    de: "Belastbarer 4-Wege-Stretch-Stoff mit hervorragender Rücksprungkraft. Chlor- und UV-beständig mit blickdichtem Maschenbild auch unter Dehnung. Erste Wahl für Bademode, Yoga-Leggings und Kompressionskleidung.",
    ar: "قماش سبانديكس ليكرا مطاطي رباعي الاتجاهات بقدرة استرجاع ممتازة. مقاوم للكلور والأشعة فوق البنفسجية وكثيف لا يشف عند التمدد. مثالي لملابس السباحة واليوغا والملابس الضاغطة."
  },
  "voal-ultrafine-premium": {
    en: "Ultrafine voal fabric with a soft cotton-like handfeel, cool drape, and rigid forehead stability without muffling hearing. Achieves up to 85% double-sided sublimation penetration for pastel and bold palettes alike. The premier choice for printed square hijabs and Muslimah scarves.",
    zh: "优质极细密丝光薄纱（Voal Ultrafine），棉柔亲肤、透气挺括，佩戴贴合且不影响听觉。热升华双面透色度高达85%，色彩纯正雅致。方巾头巾及印花穆斯林围巾的首选面料。",
    ja: "極細のウルトラファインボイル生地。コットンライクな柔らかな風合いで涼しく、額部分がしっかり立ち上がります。昇華プリントの裏抜け率は最大85%で、スクエアヒジャブやスカーフに最適です。",
    de: "Feinster Voile-Stoff mit weichem Baumwollgriff, atmungsaktiv und formstabil an der Stirn. Bis zu 85% beidseitige Farbdurchdringung bei Sublimation. Perfekt für bedruckte Hijabs und exklusive Halstücher.",
    ar: "قماش فوال فائق النعومة بملمس قطني لطيف، منسدل ومنعش وثابت على الجبين. يحقق نفاذية طباعة تسامي على الوجهين تصل إلى 85% للألوان الهادئة والجريئة. الخيار الأول للحجاب الإسلامي والأوشحة المطبوعة."
  },
  "polyester-silk-satin": {
    en: "Polyester satin fabric with an opulent silk luster, ultra-smooth surface, and graceful fluid drape. Delivers sharp contrast and vivid color gradients for arabesque and floral motifs. Perfect for satin pashmina hijabs, designer scarves, and evening modest gowns.",
    zh: "奢华丝光聚酯缎面，触感丝滑，垂坠感极佳。可呈现高清晰度与细腻渐变色彩的热升华图案。非常适合丝缎长头巾（Pashmina）、高定丝巾及派对穆斯林礼服。",
    ja: "上品なシルクの光沢としなやかなドレープ感を持つポリエステルサテン。アラベスク調や花柄モチーフを鮮明かつ美しいグラデーションで再現します。パシュミナや高級スカーフ、ドレスに最適です。",
    de: "Polyester-Seidensatin mit edlem Glanz, ultra-glatter Haptik und fließendem Fall. Garantiert lebendige Farbkontraste und saubere Farbverläufe. Bestens geeignet für Satin-Pashminas, Seidentücher und festliche Kleider.",
    ar: "قماش ساتان بوليستر بلمعان حريري فخم وسطح ناعم وانسدال أنيق. يوفر تبايناً لونياً دقيقاً وتدرجات حادة للزخارف العربية والورود. مثالي لأوشحة الباشمينا والحجاب والفساتين الفاخرة."
  },
  "armani-silk-royal": {
    en: "Haute-couture synthetic silk fabric offering a luxurious cool touch, supple flow, and sophisticated masculine matte sheen. The signature fabric for contemporary Koko shirts, Eid menswear, cool-silk thobes, and monogram-printed pashminas.",
    zh: "高级定制级合成真丝面料，触感冰凉爽滑，垂顺自然，具优雅沉稳的哑光微泽。是现代男士Koko衬衫、开斋节男士服饰、清凉丝质长袍及花押字母长巾的首选尊贵面料。",
    ja: "高級オートクチュール品質の合成シルク。ひんやりとした涼感と美しい落ち感、上品なマット光沢を兼ね備えています。男性用ココシャツやムスリム礼服、モノグラムスカーフに最適です。",
    de: "Synthetische Seide auf Haute-Couture-Niveau mit edler kühler Haptik, fließendem Fall und mattem Schimmer. Beliebt für moderne Koko-Hemden, Festtags-Herrenmode und Monogramm-Pashminas.",
    ar: "قماش حرير صناعي فاخر بلمسة باردة مريحة وانسدال انسيابي ولمعان غير لامع وراقٍ. الخيار الأمثل لقمصان كوكو الحديثة وأزياء العيد الرجالية والعباءات الراقية وأوشحة المونوغرام."
  },
  "chiffon-ceruty-babydoll": {
    en: "Ceruty chiffon fabric with a delicate crepe texture, elegant drape, and airy coolness. Renders soft pastel hues with poetic subtlety. The top selection for double-layered Syari khimars, Muslimah outer coats, and instant hijabs.",
    zh: "雪纺雪绒绉布（Ceruty Babydoll），轻盈悬垂、质感细腻凉爽。非常适合呈现柔美温婉的巴斯特色彩。双层Syari希马尔大头巾、长开衫罩衫及即戴式头巾的指定首选面料。",
    ja: "上品なシボ感と繊細な砂地テクスチャーを持つセルティシフォン。流れるような優雅な落ち感と涼やかさがあり、柔らかなパステルトーンのプリントに最適。レイヤードヒジャブやアウターに人気です。",
    de: "Ceruty-Babydoll-Chiffon mit zarter Sand-Kräuselstruktur, wunderschön fließend und angenehm kühl. Ideal für doppellagige Khimars, Damenüberwürfe und Sofort-Hijabs.",
    ar: "قماش شيفون سيروتي بيبي دول بنسيج رملي رقيق وانسيابية أنيقة وتبريد فائق. ينتج ألوان باستيل ناعمة ومحتشمة. الخيار الأول لخمار الطبقات المزدوجة وعباءات الكارديجان والحجاب الفوري."
  },
  "shakila-twill-stretch": {
    en: "Slightly stretchy diagonal twill weave fabric featuring a cotton-smooth surface, complete opacity, and breathable comfort. Perfect for modern tunics, modest two-piece coordinates, professional modest blouses, and ethnic motif culottes.",
    zh: "斜纹微弹面料（Shakila Twill），表面光洁似棉，完全不透且轻盈透气。非常适合现代穆斯林长款上衣、两件套套装、职业衬衫及民族印花阔腿裤。",
    ja: "なめらかな綾織り（ツイル）微ストレッチ素材。コットンのような優しい肌触りで透け感がなく、非常に涼しい着心地。モダンなチュニックやオフィス向けブラウス、ワイドパンツに最適です。",
    de: "Leicht elastischer Diagonal-Twill mit baumwollartiger Haptik, blickdicht und atmungsaktiv. Hervorragend geeignet für moderne Tuniken, Ensembles, Business-Hemden und Culotte-Hosen.",
    ar: "قماش شاكيلا تويل مائل مطاطي خفيف بملمس ناعم يشبه القطن، غير شفاف وبارد جداً. مثالي للتونيكات المحتشمة وأطقم البدلات والقمصان العملية وبناطيل الكولوت بطبعات تراثية."
  },
  "canvas-polyester-industrial": {
    en: "Sturdy 8oz polyester canvas with crisp woven texture and high abrasion resistance. Yields radiant sublimation colors with razor-sharp botanical and geometric details. The prime fabric for living room sofa cushions, table runners, aesthetic tote bags, and wall art canvases.",
    zh: "坚韧的8盎司聚酯帆布，纹理清晰扎实，耐磨耐用。热升华色彩极其明亮，植物花卉与几何细节锐利。客厅抱枕套、桌旗桌布、环保帆布袋及艺术画作画布的首选材料。",
    ja: "高耐久な8オンスのポリエステルキャンバス生地。はっきりとした織り目で摩耗に強く、発色の良い昇華転写プリントが可能。クッションカバー、テーブルランナー、トートバッグ、ファブリックパネルに最適です。",
    de: "Stabiles 8oz-Polyester-Canvas mit prägnanter Webstruktur und hoher Abriebfestigkeit. Liefert leuchtende Sublimationsdrucke mit scharfen Details. Ideal für Dekokissen, Tischläufer, Tragetaschen und Wandleinwände.",
    ar: "قماش كانفاس بوليستر متين وزن 8 أونصة بنسيج محكم ومقاوم للتآكل. ينتج ألوان تسامي زاهية وتفاصيل نباتية دقيقة. الخيار الأول لوسائد الأريكة ومفارش الطاولات وحقائب التوت واللوحات الجدارية."
  },
  "velvet-velboa-plush": {
    en: "Luxury micro-pile plush velvet fabric, delightfully soft to the touch and radiating a shimmering luster under ambient lighting. A sought-after choice for high-end sofa cushions, printed throw blankets, artistic wall tapestries, and accent furniture upholstery.",
    zh: "高档微毛绒天鹅绒（Velboa Plush），触感亲肤极其柔软，室内灯光下泛着奢华丝绒微光。高档沙发靠垫、印花法兰绒盖毯、艺术挂毯及家具软包面料的热选。",
    ja: "密度の高い極細毛足を持つ高級ベルベット素材。うっとりするほど柔らかく、照明の下で高級感ある光沢を放ちます。ラグジュアリークッション、プリントブランケット、タペストリーに人気です。",
    de: "Edler Mikro-Plüsch-Samt mit dichter Faserstruktur, samtweichem Griff und luxuriösem Glanz. Sehr beliebt für Sofakissen, bedruckte Kuscheldecken, Wandbehänge und Bezugsstoffe.",
    ar: "قماش مخملي فاخر بشعيرات ميكرو دقيقة ناعمة جداً ولمعان فخم تحت إضاءة الغرفة. خيار مفضل لوسائد الأريكة الفاخرة والبطانيات المطبوعة واللوحات الجدارية وتنجيد الأثاث."
  },
  "blackout-curtain-thermal": {
    en: "Extra-wide 110-inch blackout curtain fabric woven with a 3-pass black yarn thermal barrier. Blocks 100% of incoming sunlight, delivers interior thermal insulation, and dampens acoustic reverberation. The benchmark standard for star hotel interiors, luxury villas, and master bedrooms.",
    zh: "超宽幅110英寸遮光窗帘布，采用三层黑丝隔热消音结构。可100%阻隔日光，维持室内温凉并有效降噪。星级酒店、度假别墅及奢华主卧室内工程的指定标准面料。",
    ja: "110インチ超広幅の3層ブラックヤーン遮光カーテン生地。太陽光を100%遮断し、冷暖房効率を高め、防音効果も備えています。高級ホテルや別荘、寝室のインテリアに最適なプロ仕様素材です。",
    de: "Extrabreiter 110-Zoll-Verdunkelungsstoff mit 3-lagiger Thermo-Gewebestruktur. Hält 100% des Sonnenlichts ab, isoliert gegen Hitze/Kälte und dämpft Schall. Standard für Sternehotels, Villen und Premium-Schlafzimmer.",
    ar: "قماش ستائر عريض جداً 110 بوصات بهيكل نسيج عازل أسود ثلاثي الطبقات. يحجب 100% من ضوء الشمس، ويعزل حرارة الغرفة، ويقلل الضوضاء. المعيار المعتمد للفنادق الفخمة والفلل وغرف النوم الراقية."
  },
  "microfiber-suede-absorb": {
    en: "Ultra-absorbent microfiber suede fabric with a velvety handfeel that glides across delicate surfaces without scratching. Yields crisp, vivid print resolution. Designed for bespoke hotel bath towels, spa beach blankets, suede yoga mats, and optical lens cloths.",
    zh: "超强吸水微麂皮绒面料，触感如天鹅绒般细腻亲肤，清洁精密表面绝不刮伤。印花细腻高保真。适用于酒店定制浴巾、SPA沙滩巾、麂皮绒瑜伽垫及高级光学擦镜布。",
    ja: "抜群の吸水性を誇るマイクロファイバースエード生地。ベルベットのような滑らかな肌触りで、繊細な表面も傷つけません。高級ホテル用タオル、ビーチタオル、ヨガマット、メガネ拭きに最適です。",
    de: "Saugstarkes Mikrofaser-Wildleder mit samtweicher Haptik, das empfindliche Oberflächen schont. Gestochen scharfer Fotodruck. Geeignet für Hotelhandtücher, Strandtücher, Yoga-Matten und Brillenputztücher.",
    ar: "قماش مايكروفايبر شمواه فائق الامتصاص للماء بملمس مخملي ناعم لا يخدش الأسطح الحساسة. طباعة زاهية ودقيقة. مناسب لمناشف الفنادق الفاخرة ومناشف الشاطئ وبسط اليوغا وقطع تنظيف العدسات."
  },
  "taffeta-parachute-ripstop": {
    en: "Ultra-lightweight parachute taffeta engineered with a tear-proof ripstop cross-grid. Withstands severe outdoor wind gusts, dries instantly, and achieves 90% show-through dye saturation. The industry standard for organizational flags, event bunting, stadium banners, and promotional windbreaker jackets.",
    zh: "超轻量降落伞塔夫绸，配有防撕裂格纹加固网。抗户外大风吹拂，速干防雨，双面透光度高达90%。机构旗帜、展会道旗、球场巨幅标语旗及防风风衣夹克的行业首选标杆。",
    ja: "引き裂きに強いリップストップ格子補強が施された超軽量パラシュートタフタ。屋外の強風に耐え、速乾性があり、裏抜け率は最大90%。社旗、イベントのぼり旗、スタジアム幕、ウインドブレーカーに最適です。",
    de: "Ultraleichtes Fallschirm-Taftgewebe mit reißfester Ripstop-Gitterstruktur. Windfest im Außenbereich, schnelltrocknend und bis zu 90% Farbdurchdruck. Standard für Firmenflaggen, Event-Banner und Windbreaker.",
    ar: "قماش تفتا باراشوت خفيف للغاية مع نسيج شبكي مقاوم للتمزق (ريب ستوب). يتحمل الرياح الخارجية القوية، سريع الجفاف، وشفافية طباعة تصل إلى 90%. الخيار الأول للأعلام والرايات والسترات الإعلانية."
  },
  "polyester-oxford-600d": {
    en: "Rugged 600-denier basket-weave oxford fabric with waterproof PU backing. Built for rigorous friction, extreme weather, and heavy-duty load handling. Ideal for corporate laptop backpacks, merchandise duffle bags, promotional canopies, and exhibition display booths.",
    zh: "坚固耐磨的600D牛津纺篮式织物，背面配有防水PU涂层。抗重度摩擦，无惧恶劣天候。企业定制电脑背包、旅行行李袋、户外促销遮阳篷及展会展台背景布的专业之选。",
    ja: "裏面に防水PUコーティングを施した高耐久600デニール・オックスフォード生地。摩擦や過酷な天候に強く、優れた耐久性を発揮。PCリュック、ダッフルバッグ、イベント用テントに最適です。",
    de: "Robustes 600D-Oxford-Gewebe mit wasserdichter PU-Beschichtung auf der Rückseite. Reiß- und wetterfest für harte Beanspruchung. Perfekt für Laptop-Rucksäcke, Reisetaschen, Werbezelte und Messe-Displays.",
    ar: "قماش بوليستر أكسفورد 600 دينير متين بطبقة بولي يوريثان مقاومة للماء في الخلف. هيكل قوي مقاوم للاحتكاك الشديد ولتقلبات الطقس. مثالي لحقائب الظهر وحقائب السفر وخيام الفعاليات وأكشاك المعارض."
  },
  "tc-sublimasi-cotton-feel": {
    en: "24s knit blend pairing micro-polyester filaments with premium rayon fibers. Merges photographic full-print sublimation fidelity with the breezy, sweat-absorbent, non-cling comfort of combed cotton. The premier base for streetwear t-shirts, band merchandise, and lifestyle apparel.",
    zh: "24支微聚酯与高档人棉混纺针织布。兼具数码满版热升华印花的高保真色彩与精梳棉般的透气吸汗、不粘身干爽手感。潮牌T恤、乐队周边及社群服饰的标配首选面料。",
    ja: "マイクロポリエステルとレーヨンをブレンドした24番手天竺編み。昇華プリントの鮮やかな発色と、コーマコットンのような通気性・吸汗性・肌離れの良さを両立。ストリート系Tシャツやグッズに最適です。",
    de: "24s-Mischgestrick aus Mikro-Polyester und Viskose. Vereint gestochen scharfen Sublimations-Allover-Druck mit dem kühlen, saugfähigen Tragegefühl gekämmter Baumwolle. Perfekt für Streetwear-T-Shirts und Band-Merch.",
    ar: "قماش تريكو 24s يجمع بين ألياف البوليستر الدقيقة والقطن المعالج الفاخر. يجمع بين دقة ألوان الطباعة الكاملة مع ملمس القطن البارد الممتص للعرق. مثالي لقمصان التيشيرت والأزياء العصرية والمقتنيات."
  },
  "dryfit-jarum-quickdry": {
    en: "Precision needle-drop micro-porous knit fabric engineered for intensive airflow, featherweight carry, and non-cling performance when wet. High in demand for marathon running vests, cycling jerseys, and endurance activewear.",
    zh: "细密针眼（Needle-Drop）微孔透气针织面料。专为高强度气流循环设计，质地极轻，出汗时不贴身。马拉松跑步背心、公路自行车骑行服及耐力运动服的抢手爆款。",
    ja: "規則的な針穴状のマイクロポア（小孔）を持つニードルドロップ素材。強力な通気性、羽のような軽さ、汗をかいても肌にまとわりつかない快適さを実現。マラソンやサイクリングジャージに人気です。",
    de: "Präzises Nadel-Loch-Gestrick für maximale Luftzirkulation. Federleicht und klebt auch bei starkem Schwitzen nicht am Körper. Äußerst gefragt für Marathon-Singlets und Radtrikots.",
    ar: "قماش محبوك بفتحات مسامية دقيقة تشبه ثقوب الإبرة لتهوية مكثفة. خفيف جداً ولا يلتصق بالجسم عند البلل. مطلوب بشدة لقمصان سباقات الماراثون والدراجات وملابس اللياقة البدنية."
  }
};

const FAQ_TRANSLATIONS = {
  "cmv9nuwjg0007xm6ph7309jnu": {
    q: {
      en: "What is the recommended minimum file resolution for sublimation printing?",
      zh: "热升华打印的最低推荐文件分辨率是多少？",
      ja: "昇華転写プリントに推奨される最小ファイル解像度はどのくらいですか？",
      de: "Welche Mindestauflösung wird für den Sublimationsdruck empfohlen?",
      ar: "ما هو الحد الأدنى الموصى به لدقة الملف لطباعة التسامي؟"
    },
    a: {
      en: "We recommend 150–300 DPI at actual output print size. Our online 3D visualizer will prompt an alert if your uploaded graphic falls beneath this optimal threshold.",
      zh: "我们建议在实际打印尺寸下采用150–300 DPI分辨率。若上传的文件低于此阈值，在线3D模拟器会自动发出提示。",
      ja: "実寸サイズで150〜300 DPIを推奨しております。アップロードされた画像の解像度が基準を下回る場合、3Dビジュアライザーが警告を表示します。",
      de: "Wir empfehlen 150–300 DPI bei tatsächlicher Druckgröße. Der Online-Visualisierer warnt automatisch, wenn die Auflösung unter diesen Schwellenwert fällt.",
      ar: "نوصي بدقة 150-300 نقطة في البوصة بالحجم الفعلي للطباعة. سيقوم محاكي الطباعة ثلاثي الأبعاد بتنبيهك إذا كانت الدقة أقل من هذا المعيار."
    }
  },
  "cmv9nux060008xm6ppghk4lhi": {
    q: {
      en: "How are wholesale tiered volume discounts calculated?",
      zh: "批量阶梯批发价格是如何计算的？",
      ja: "ボリュームディスカウント（段階的価格）はどのように計算されますか？",
      de: "Wie werden die gestaffelten Mengenrabatte berechnet?",
      ar: "كيف يتم حساب أسعار الجملة التنازلية حسب الكمية؟"
    },
    a: {
      en: "Unit price per meter scales down progressively as your total meterage per fabric increases. The active tier discount is dynamically applied in the calculator and checkout cart.",
      zh: "每米单价随每种面料订购总长度的增加而逐级降低。适用的优惠阶梯可在价格计算器和购物车中即时查看。",
      ja: "生地ごとの注文合計メーター数が増えるほど、1メートルあたりの単価がお安くなります。適用される価格帯は計算機やカート内でリアルタイムに確認できます。",
      de: "Der Meterpreis sinkt automatisch mit steigender Gesamtlänge pro Stoffart. Die jeweils geltende Preisstufe wird direkt im Rechner und im Warenkorb angezeigt.",
      ar: "ينخفض سعر المتر تلقائياً مع زيادة إجمالي الأمتار المطلوبة لكل نوع قماش. تظهر الفئة السعرية المستحقة فوراً في الحاسبة وسلة المشتريات."
    }
  },
  "cmv9nuxbc0009xm6pxfsfgbft": {
    q: {
      en: "Can we request a physical strike-off proof prior to mass production?",
      zh: "量产前是否可以申请实物打样（Proofing）？",
      ja: "大量生産の前に現物の色校正（プルーフ）を確認できますか？",
      de: "Ist ein physischer Andruck vor der Serienproduktion möglich?",
      ar: "هل يمكن طلب عينة طباعة فعلية قبل بدء الإنتاج الضخم؟"
    },
    a: {
      en: "Yes. Alongside 3D digital simulation, we provide 1-yard physical fabric strike-off sample prints so you can evaluate precise color matching under your standard lighting setup.",
      zh: "可以。除了在线3D数码校样外，我们还提供1码（约0.9米）实物打印小样，方便您在标准灯光下精准核对色板与质感。",
      ja: "はい、可能です。3Dデジタル校正に加え、標準照明下で色味を細かく確認できるよう、1ヤードの実物サンプルの出力サービスをご用意しております。",
      de: "Ja. Neben der digitalen 3D-Simulation bieten wir einen 1-Yard-Musterdruck an, damit Sie die Farben unter Ihren Standard-Lichtverhältnissen prüfen können.",
      ar: "نعم. بالإضافة إلى المحاكاة الرقمية ثلاثية الأبعاد، نوفر طباعة عينة قماشية بطول 1 ياردة حتى تتمكن من معاينة مطابقة الألوان تحت إضاءتك المعتمدة."
    }
  },
  "cmv9nuxmj000axm6p3mmjnyfx": {
    q: {
      en: "How are intercity and regional cargo shipments handled?",
      zh: "跨城市及长途货物是如何打包与运输的？",
      ja: "他都市や遠方への配送はどのように行われますか？",
      de: "Wie läuft der Frachtversand in andere Städte und Regionen ab?",
      ar: "كيف يتم شحن الطلبيات إلى المدن الأخرى والمحافظات؟"
    },
    a: {
      en: "Dispatched via specialized roll-freight logistics partners (Dakota Cargo, JNE Trucking) or our dedicated corporate delivery fleet across Greater Jakarta and Bandung. Each roll is hermetically sealed in heavy-gauge polymer wrap with protective end caps.",
      zh: "通过专业布卷物流专线（Dakota Cargo、JNE Trucking）或我们在雅加达大都市区与万隆的自有车队配送。布卷均采用加厚防水塑料薄膜及护角纸筒严密封装。",
      ja: "反物専用の貨物便（Dakota Cargo、JNE Trucking）またはジャカルタ・バンドン近郊向けの自社配送便にてお届けします。各ロールは厚手プラスチックと保護段ボールで厳重に梱包されます。",
      de: "Der Versand erfolgt über spezialisierte Rollenfracht-Speditionen (Dakota Cargo, JNE Trucking) oder unsere eigene Flotte in Jakarta und Bandung. Jede Rolle ist in dicke Folie und Kantenschutz verpackt.",
      ar: "يتم الشحن عبر شركات الشحن المتخصصة في لفائف الأقمشة أو عبر أسطولنا الخاص في جاكرتا الكبرى وباندونغ. تُغلف كل لفة ببلاستيك سميك مع كرتون مقوى للحماية."
    }
  }
};

const HERO_TRANSLATIONS = {
  "cmv9nutqu0000xm6plchqt0o7": {
    tag: {
      en: "Digital Sublimation Printers",
      zh: "工业级数码热升华打印机",
      ja: "産業用デジタル昇華プリンター",
      de: "Industrielle Digital-Sublimationsdrucker",
      ar: "ماكينات طباعة التسامي الرقمية الصناعية"
    },
    caption: {
      en: "“Operators fine-tuning ICC color profiles directly on the digital sublimation printing control console.”",
      zh: "“专业技师在数码升华打印机控制台精细校准ICC色彩配置文件，确保批次零色差。”",
      ja: "「デジタル昇華印刷機のコントロールパネルにて、オペレーターがICCカラープロファイルを高精度にキャリブレーション。」",
      de: "„Bediener kalibrieren ICC-Farbprofile an der Konsole industrieller Sublimationsdrucker.“",
      ar: "«يقوم الفني بمعايرة ملفات تعريف الألوان ICC بدقة متناهية على لوحة التحكم المركزية للطابعات الرقمية.»"
    },
    alt: {
      en: "Industrial-scale digital dye-sublimation transfer paper printing line",
      zh: "工业级数码热升华转印纸连续印刷流水线",
      ja: "産業用デジタル昇華転写紙プリント工程",
      de: "Industrielle Digital-Transferpapier-Drucklinie",
      ar: "خط طباعة ورق التسامي الرقمي على نطاق صناعي"
    }
  },
  "cmv9nuu7l0001xm6ppuiahig9": {
    tag: {
      en: "Hijab & Fashion Voal",
      zh: "头巾与时尚巴厘纱（Voal）",
      ja: "ヒジャブ＆ファッションボイル",
      de: "Hijab & Fashion-Voile",
      ar: "الحجاب وأقمشة الفوال العصرية"
    },
    caption: {
      en: "“Ultrafine voal fabric custom printed with ultra-soft drape and precision double-sided strike-through.”",
      zh: "“极细巴厘纱个性化数码印花，质地柔美垂顺，双面透色精准均匀。”",
      ja: "「柔らかなドレープ感と正確な両面発色を兼ね備えたウルトラファインボイルの特注プリント。」",
      de: "„Ultrafine-Voile-Stoff mit weichem Fall und präzisem doppelseitigem Farbdurchdruck.“",
      ar: "«قماش فوال فائق النعومة مطبوع بنقوش خاصة مع انسيابية ناعمة ونفاذية لونية دقيقة على الوجهين.»"
    },
    alt: {
      en: "Voal Ultrafine fabric featuring modern floral and batik sublimation print patterns",
      zh: "现代印尼蜡染与几何花卉图案热升华打印的Voal Ultrafine头巾面料",
      ja: "モダンなバティックや花柄が昇華プリントされた高級ボイル生地",
      de: "Voile Ultrafine Stoff mit modernem Batik- und Blumen-Sublimationsdruck",
      ar: "قماش فوال فائق النعومة بطباعة تسامي عصرية بنقوش الباتيك والورود"
    }
  },
  "cmv9nuuir0002xm6pyipatylg": {
    tag: {
      en: "Sportswear & Dryfit Milano",
      zh: "运动服饰与Dryfit Milano",
      ja: "スポーツウェア＆ドライフィットミラノ",
      de: "Sportbekleidung & Dryfit Milano",
      ar: "الملابس الرياضية ودراي فت ميلانو"
    },
    caption: {
      en: "“Colorfast Dryfit Milano and Poly Spandex textiles engineered for team kits, athletic jerseys, and activewear.”",
      zh: "“耐水洗防掉色的Dryfit Milano与聚酯弹力面料，为战队队服、球衣及运动装备量身定制。”",
      ja: "「色あせに強いドライフィットミラノとポリスパンデックス。チームウェアやアクティブウェアに最適。」",
      de: "„Farbechte Dryfit Milano- und Poly-Spandex-Stoffe für Teamtrikots und Funktionskleidung.“",
      ar: "«أقمشة دراي فت ميلانو وبولي سبانديكس مقاومة للبهتان مخصصة لزي الفرق والملابس الرياضية عالية الأداء.»"
    },
    alt: {
      en: "Dryfit Milano fabric with vibrant neon sublimation team kit graphics",
      zh: "采用高饱和霓虹荧光色热升华打印的Dryfit Milano队服面料",
      ja: "鮮やかなネオンカラーが昇華プリントされたドライフィットミラノ素材",
      de: "Dryfit Milano Stoff mit leuchtendem Neon-Sublimationsdruck für Sporttrikots",
      ar: "قماش دراي فت ميلانو مع طباعة تسامي بألوان نيون زاهية لقمصان الأندية"
    }
  },
  "cmv9nuuty0003xm6puwpup8p8": {
    tag: {
      en: "Rotary Heat Press Calender 210°C",
      zh: "210°C滚筒连续热转印机",
      ja: "210℃大型ロータリーカレンダー熱プレス",
      de: "Rotations-Kalander-Presse 210°C",
      ar: "ماكينة الكالندر الحرارية الدوارة 210 درجة مئوية"
    },
    caption: {
      en: "“The 210°C rotary calender converts disperse dye into gas, locking colors permanently into core fibers.”",
      zh: "“210°C高温滚筒转印机将分散染料瞬间气化，使色彩牢固分子级渗透锁入纤维核心。”",
      ja: "「210℃のロータリーカレンダーが分散染料を気化させ、繊維の芯まで色彩を強固に定着。」",
      de: "„Der 210°C-Rotationskalander fixiert Dispersionsfarben dauerhaft direkt in den Fasern.“",
      ar: "«تعمل ماكينة الكالندر الدوارة عند 210 درجات مئوية على تحويل صبغات التسامي إلى غاز يخترق عمق الألياف لتثبيت دائم.»"
    },
    alt: {
      en: "Roll-to-roll continuous rotary heat press sublimation calender with 210°C heated cylinder drum",
      zh: "配备210°C电热加温滚筒的卷对卷连续热升华滚筒转印机",
      ja: "210℃の加熱シリンダードラムを備えたロール・ツー・ロール昇華転写カレンダー機",
      de: "Roll-to-Roll kontinuierlicher Sublimations-Rotationskalander mit 210°C Heizzylinder",
      ar: "ماكينة كالندر حرارية دوارة من لفة إلى لفة مع أسطوانة تسخين عند 210 درجات مئوية"
    }
  }
};

const TESTIMONIAL_TRANSLATIONS = {
  "cmv9nuvao0004xm6pynm44xhl": {
    en: "The neon saturation on Dryfit Milano is exceptionally consistent across production batches. For our 3,000-meter tournament uniform roll, we didn't have to reject or re-sort a single roll.",
    zh: "Dryfit Milano上的荧光色彩在各个生产批次间表现出高度一致性。在针对3,000米锦标赛制服的订单中，我们甚至无需进行二次人工挑拣。",
    ja: "ドライフィットミラノのネオンカラーはロット間のブレが全くありません。大会用3,000メートルの大口発注でも再選別の手間が一切かかりませんでした。",
    de: "Die Neonfarben auf Dryfit Milano sind über alle Chargen hinweg absolut konsistent. Bei unserem 3.000-Meter-Turnierauftrag mussten wir keine einzige Rolle nachsortieren.",
    ar: "ألوان النيون على دراي فت ميلانو متطابقة تماماً بين جميع الدفعات. في طلبية بطولة رياضية بطول 3000 متر، لم نحتج لفرز الأقمشة مرة أخرى أبداً."
  },
  "cmv9nuvrf0005xm6ps3xqvpzr": {
    en: "The Voal fabric drapes gracefully with superb double-sided color penetration. The tiered pricing system kept the production budget for our Eid Festive collection strictly within target.",
    zh: "巴厘纱面料垂顺温和，双面透色度极佳。透明的阶梯批发价格让我们的开斋节节日系列的制作成本得到了极佳的控制。",
    ja: "ボイル生地の落ち感がとても上品で、裏抜けの良さにも大満足です。ボリュームディスカウントのおかげで、季節コレクションの予算管理がスムーズでした。",
    de: "Der Voile-Stoff fällt wunderbar weich und hat eine hervorragende beidseitige Farbdurchdringung. Die Preisstaffelung hat unser Festtags-Kollektionsbudget optimal geschont.",
    ar: "قماش الفوال ينسدل برقة بالغة ونفاذية ألوانه على الوجهين ممتازة. كما ساعدنا نظام الأسعار التنازلية في ضبط ميزانية مجموعة أزياء العيد بدقة."
  },
  "cmv9nuw2m0006xm6p9zhogcko": {
    en: "Digital strike-off proofs and live production tracking enabled our procurement department to supervise 800 meters of custom canvas without tedious back-and-forth phone inquiries.",
    zh: "实物数码打样与生产工单实时追踪，让我们采购部门在跟进800米定制帆布时无需频繁电话沟通，效率倍增。",
    ja: "デジタル校正とSPK作業指示のオンライン追跡機能により、調達チームは電話対応に追われることなく、800メートルのキャンバス生産を安心して見守れました。",
    de: "Dank digitaler Freigabe und SPK-Auftragsverfolgung konnte unsere Einkaufsabteilung 800 Meter Canvas ohne ständige Telefonate transparent überwachen.",
    ar: "سهلت العينات الرقمية وتتبع أوامر العمل الإلكترونية على فريق المشتريات لدينا متابعة 800 متر من الكانفاس دون الحاجة للاتصالات الهاتفية المتكررة."
  }
};

const SITE_CONTENT_TRANSLATIONS = {
  "homepage.cta_b2b": {
    title: {
      en: "Need regular supply exceeding 5,000 meters per month?",
      zh: "每月稳定需求超过5,000米面料？",
      ja: "月間5,000メートル以上の定期的な生地供給をご希望ですか？",
      de: "Benötigen Sie regelmäßig über 5.000 Meter Stoff pro Monat?",
      ar: "هل تحتاج إلى توريد دوري يتجاوز 5000 متر شهرياً؟"
    },
    description: {
      en: "Flexible 30/60-day payment terms available for verified business partners, free swatch books, and dedicated key account managers.",
      zh: "为认证企业合作伙伴提供30/60天账期信贷支持、免费色卡样布册以及一对一专属大客户经理服务。",
      ja: "認証済みパートナー企業様には30/60日の支払い条件、無料スウォッチサンプル、専任セールス担当をご用意しております。",
      de: "30/60 Tage Zahlungsziel für verifizierte Partner, kostenlose Stoffmusterbücher und persönlicher B2B-Kundenbetreuer verfügbar.",
      ar: "تسهيلات دفع 30/60 يوماً للشركاء التجاريين المعتمدين، مع عينات أقمشة مجانية ومسؤول مبيعات مخصص لحسابك."
    },
    actionText: {
      en: "Request B2B Quote",
      zh: "索取批发报价",
      ja: "お見積りを依頼する",
      de: "Angebot anfordern",
      ar: "طلب عرض سعر تجاري"
    }
  },
  "homepage.stats": [
    {
      k: {
        en: "Daily Capacity",
        zh: "日产能规模",
        ja: "日産生産能力",
        de: "Tageskapazität",
        ar: "الطاقة الإنتاجية اليومية"
      }
    },
    {
      k: {
        en: "Ready-Print Fabrics",
        zh: "现货升华面料",
        ja: "即納昇華対応生地",
        de: "Sofort druckbereite Stoffe",
        ar: "أنواع أقمشة جاهزة للطباعة"
      }
    },
    {
      k: {
        en: "Garment Partners",
        zh: "合作制衣企业",
        ja: "提携アパレル企業",
        de: "Bekleidungspartner",
        ar: "شركاء مصانع الألبسة"
      }
    }
  ],
  "site.pages": {
    aboutTitle: {
      en: "About PT. Texora Visi Prima",
      zh: "关于 PT. Texora Visi Prima",
      ja: "PT. Texora Visi Prima について",
      de: "Über PT. Texora Visi Prima",
      ar: "عن شركة تيكسورا فيسي بريما"
    },
    aboutDescription: {
      en: "Industrial-scale textile manufacturing and digital dye-sublimation printing facility located in North Jakarta, Indonesia.",
      zh: "位于印度尼西亚北雅加达的工业级纺织制造与数码热升华转印工厂。",
      ja: "インドネシア・北ジャカルタに拠点を置く産業用テキスタイル製造・デジタル昇華転写プリント工場。",
      de: "Industrielle Textilmanufaktur und Digital-Sublimationsdruckerei in Nord-Jakarta, Indonesien.",
      ar: "مصنع نسيج وطباعة تسامي رقمية على نطاق صناعي يقع في شمال جاكرتا، إندونيسيا."
    },
    aboutCaption: {
      en: "OEKO-TEX export-grade quality textiles crafted for fashion and sportswear manufacturing brands.",
      zh: "为时尚与运动服装制造品牌打造符合OEKO-TEX国际出口标准的优质面料。",
      ja: "ファッション＆スポーツウェアブランド向けのOEKO-TEX輸出基準を満たす高品質テキスタイル。",
      de: "OEKO-TEX-zertifizierte Textilien in Exportqualität für Mode- und Sportbekleidungsmarken.",
      ar: "أقمشة بمعايير الجودة العالمية المعتمدة من OEKO-TEX مخصصة لعلامات الأزياء والملابس الرياضية."
    }
  }
};

const SEO_META_TRANSLATIONS = {
  "/": {
    title: {
      en: "Industrial Sublimation Fabric & Textile Manufacturing | Texora",
      zh: "工业级热升华面料与纺织品制造工厂 | Texora",
      ja: "産業用昇華転写生地＆テキスタイル製造工場 | Texora",
      de: "Industrielle Sublimationsstoffe & Textilmanufaktur | Texora",
      ar: "مصنع أقمشة التسامي والمنسوجات الصناعية | تيكسورا"
    },
    description: {
      en: "Industrial-scale polyester fabric manufacturing and digital dye-sublimation facility in North Jakarta. Ready-to-print fabrics, tiered wholesale pricing, and 3D visualizer.",
      zh: "位于北雅加达的工业级聚酯面料生产与数码热升华工厂。提供现货打印布卷、批量阶梯批发价、在线3D模拟器及一站式B2B平台。",
      ja: "北ジャカルタの産業用ポリエステル生地製造およびデジタル昇華転写工場。即納生地カタログ、段階的卸売価格、3Dシミュレーター完備。",
      de: "Industrielle Polyesterstoff-Fertigung und Digital-Sublimation in Nord-Jakarta. Sofort lieferbare Stoffe, Mengenrabatte und 3D-Visualizer.",
      ar: "مصنع لتصنيع أقمشة البوليستر والطباعة بالتسامي على نطاق صناعي في شمال جاكرتا. كتالوج أقمشة جاهزة للطباعة، أسعار جملة، ومحاكي ثلاثي الأبعاد."
    }
  },
  "/catalog": {
    title: {
      en: "Sublimation Fabric & Industrial Textile Catalog | Texora",
      zh: "热升华面料与工业纺织品综合目录 | Texora",
      ja: "昇華転写生地＆産業用テキスタイル総合カタログ | Texora",
      de: "Katalog für Sublimationsstoffe & Industrielle Textilien | Texora",
      ar: "كتالوج أقمشة التسامي والمنسوجات الصناعية | تيكسورا"
    },
    description: {
      en: "Complete catalog of ready-to-print polyester fabrics: Dryfit Milano, Voal Ultrafine, Canvas, Scuba, Oxford, and more. Certified OEKO-TEX quality.",
      zh: "完整的现货热升华聚酯面料目录：Dryfit Milano、Voal Ultrafine、帆布、Scuba潜水布、牛津纺等。全规格GSM与OEKO-TEX质量保证。",
      ja: "ドライフィットミラノ、極細ボイル、キャンバス、スキューバなど昇華対応ポリエステル生地の完全カタログ。OEKO-TEX品質認証。",
      de: "Vollständiger Katalog druckbereiter Polyesterstoffe: Dryfit Milano, Voile Ultrafine, Canvas, Scuba, Oxford und mehr. OEKO-TEX-Qualitätskontrolle.",
      ar: "كتالوج شامل لأقمشة البوليستر الجاهزة للطباعة: دراي فت ميلانو، فوال فائق النعومة، كانفاس، سكوبا، أكسفورد والمزيد مع شهادة OEKO-TEX."
    }
  },
  "/about": {
    title: {
      en: "About Us — Jakarta Sublimation Textile Factory | Texora",
      zh: "关于我们 — 雅加达热升华纺织品工厂 | Texora",
      ja: "会社概要 — ジャカルタ昇華転写テキスタイル工場 | Texora",
      de: "Über Uns — Sublimationstextil-Manufaktur Jakarta | Texora",
      ar: "من نحن — مصنع منسوجات التسامي في جاكرتا | تيكسورا"
    },
    description: {
      en: "Profile of PT. Texora Visi Prima: integrated sublimation fabric manufacturer in North Jakarta. From raw textiles to digital proofing and ready-to-ship freight rolls.",
      zh: "PT. Texora Visi Prima 企业简介：位于北雅加达的综合热升华面料生产基地，涵盖原料织造、数码打样到出厂物流全流程。",
      ja: "PT. Texora Visi Primaの会社概要：北ジャカルタの総合テキスタイル昇華工場。原料調達からデジタル校正、出荷までワンストップで対応。",
      de: "Profil von PT. Texora Visi Prima: Integrierte Sublimationsfabrik in Nord-Jakarta. Von Rohstoffen über Digitalproofing bis zu versandfertigen Rollen.",
      ar: "نبذة عن شركة تيكسورا فيسي بريما: مصنع متكامل لأقمشة التسامي في شمال جاكرتا. من المواد الخام والمعاينة الرقمية حتى لفائف الأقمشة الجاهزة للشحن."
    }
  },
  "/contact": {
    title: {
      en: "Contact Us — B2B Sublimation Fabric Inquiries | Texora",
      zh: "联系我们 — B2B热升华面料采购咨询 | Texora",
      ja: "お問い合わせ — B2B昇華テキスタイル調達相談 | Texora",
      de: "Kontakt — B2B-Sublimationsstoff-Beratung | Texora",
      ar: "اتصل بنا — استشارات توريد أقمشة التسامي للشركات | تيكسورا"
    },
    description: {
      en: "Consult on B2B sublimation fabric procurement, request complimentary fabric swatch books, and get custom wholesale pricing from Texora, North Jakarta.",
      zh: "咨询B2B热升华面料采购事宜、申请免费实物布样卡，并获取大宗批发报价。专属销售团队快速响应。",
      ja: "B2B向け昇華生地の調達相談、無料生地サンプル帳のご請求、卸売お見積りはPT. Texora Visi Primaへ。",
      de: "B2B-Beratung für Textilbeschaffung, kostenlose Musterkataloge und Großhandelspreise von PT. Texora Visi Prima, Nord-Jakarta.",
      ar: "استشرنا حول توريد أقمشة التسامي للشركات، واطلب عينات مجانية، واحصل على عروض أسعار الجملة من مصنع تيكسورا في جاكرتا."
    }
  },
  "/custom-sublimation": {
    title: {
      en: "Custom Sublimation Studio — 3D Pattern Visualizer | Texora",
      zh: "个性化升华印花工作台 — 3D图案模拟器 | Texora",
      ja: "カスタム昇華プリントスタジオ — 3Dパターンビジュアライザー | Texora",
      de: "Custom-Sublimationsstudio — 3D-Muster-Visualisierer | Texora",
      ar: "استوديو التخصيص والطباعة بالتسامي — محاكي ثلاثي الأبعاد | تيكسورا"
    },
    description: {
      en: "Upload your design artwork, preview interactive 3D digital simulation, and calculate custom sublimation printing costs. 150-300 DPI supported.",
      zh: "上传您的设计文件，在线预览交互式3D效果模拟，并计算个性化升华印花费用。支持150-300 DPI超清分辨率。",
      ja: "デザインをアップロードし、リアルタイム3Dシミュレーションで仕上がりを確認。カスタム昇華プリント料金の即時見積もり可能。",
      de: "Laden Sie Ihr Design hoch, sehen Sie sich die interaktive 3D-Simulation an und kalkulieren Sie die Druckkosten. 150–300 DPI unterstützt.",
      ar: "ارفع تصاميمك، وشاهد محاكاة طباعة ثلاثية الأبعاد تفاعلية، واحسب تكلفة الطباعة المخصصة. يدعم دقة 150-300 نقطة في البوصة."
    }
  },
  "/kategori": {
    title: {
      en: "Sublimation Fabric Categories — Guide & Catalog | Texora",
      zh: "热升华面料分类导航 — 专业选品指南与目录 | Texora",
      ja: "昇華転写生地カテゴリー — ガイド＆カタログ | Texora",
      de: "Kategorien für Sublimationsstoffe — Leitfaden & Katalog | Texora",
      ar: "أقسام أقمشة التسامي — الدليل الشامل والكتالوج | تيكسورا"
    },
    description: {
      en: "Comprehensive guide for selecting sublimation fabrics: sportswear & jerseys, voal & silk hijabs, home living & interior decor, banners, and event merchandise.",
      zh: "热升华面料选材指南：运动服饰、头巾时尚、家居生活布艺、展会旗帜与周边礼品面料全品类专业导购。",
      ja: "昇華生地選びの総合ガイド：スポーツウェア、ヒジャブ、インテリア、イベント旗など用途別おすすめテキスタイル一覧。",
      de: "Umfassender Leitfaden zur Auswahl von Sublimationsstoffen für Sportswear, Hijabs, Inneneinrichtung, Werbebanner und Merchandise.",
      ar: "دليل شامل لاختيار أقمشة التسامي: الملابس الرياضية، الحجاب الحريري والفوال، الديكور المنزلي، والرايات الإعلانية."
    }
  }
};

const CATEGORY_SEO_TRANSLATIONS = {
  "kain-sportswear": {
    title: {
      en: "Sportswear & Athletic Jersey Sublimation Fabrics",
      zh: "专业运动服饰与球衣热升华面料",
      ja: "スポーツウェア＆競技用ジャージ昇華プリント生地",
      de: "Sportbekleidungs- & Jersey-Sublimationsstoffe",
      ar: "أقمشة الملابس الرياضية وقمصان الأندية للطباعة بالتسامي"
    },
    intro: {
      en: "A dedicated collection of sportswear textiles engineered for apparel brands, team uniforms, and activewear lines demanding vibrant colors and extreme stretch endurance.",
      zh: "专为服装品牌、运动俱乐部战队服及高强度训练服打造的运动面料系列，兼具鲜艳色彩与高弹力耐磨特性。",
      ja: "アパレルブランドやチームユニフォーム向けに設計された、高発色で伸縮性に優れたスポーツテキスタイルコレクション。",
      de: "Funktionsstoffe für Bekleidungsmarken und Sportvereine, die leuchtende Farben und hohe Dehnungsbeständigkeit verlangen.",
      ar: "مجموعة أقمشة رياضية متطورة مصممة لمصانع الألبسة والفرق الرياضية التي تتطلب ألواناً زاهية ومقاومة فائقة للتمدد."
    }
  },
  "kain-hijab-fashion": {
    title: {
      en: "Voal & Silk Satin Hijab Fashion Sublimation Fabrics",
      zh: "巴厘纱（Voal）与丝绸缎面穆斯林时尚面料",
      ja: "ボイル＆シルクサテン ヒジャブ・ファッション昇華生地",
      de: "Voile- & Seidensatin-Hijab-Modestoffe für Sublimation",
      ar: "أقمشة الفوال والساتان الحريري لأزياء الحجاب والموضة المحتشمة"
    },
    intro: {
      en: "Premium fabrics designed for modest fashion houses and Muslimah designers demanding gentle drape, breathable lightness, and radiant pattern clarity.",
      zh: "专为穆斯林时尚品牌与服装设计师研发的高级面料，质地轻盈柔美，透气清爽，图案细节栩栩如生。",
      ja: "モデストファッションやムスリムデザイナー向けの上品な落ち感と涼やかな軽さ、高精細プリントを備えたプレミアムテキスタイル。",
      de: "Premium-Stoffe für Modest-Fashion-Labels, die weichen Fall, atmungsaktive Leichtigkeit und strahlende Muster verlangen.",
      ar: "أقمشة فاخرة مخصصة لعلامات الأزياء المحتشمة ومصممي الحجاب، تتميز بانسيابية ناعمة وخفة منعشة ونقاء ألوان فائق."
    }
  },
  "kain-home-living": {
    title: {
      en: "Home Living, Cushion & Interior Decor Sublimation Fabrics",
      zh: "家居软装、抱枕与室内装饰热升华面料",
      ja: "ホームリビング・クッション・インテリア昇華プリント生地",
      de: "Home Living, Kissen- & Dekorationsstoffe für Sublimation",
      ar: "أقمشة الديكور المنزلي والوسائد والتصميم الداخلي للطباعة بالتسامي"
    },
    intro: {
      en: "Robust, tactile fabrics tailored for interior decorators, home accessories, sofa upholstery, and luxury printed soft furnishings.",
      zh: "专为室内软装设计师、家居周边、沙发软包及高档印花织物定制的坚韧而极具质感的面料系列。",
      ja: "インテリアコーディネーターやホームアクセサリー向けに開発された、耐久性と豊かな風合いを兼ね备えたテキスタイル。",
      de: "Robuste, strukturstarke Stoffe für Raumausstatter, Wohnaccessoires, Polsterungen und edle Wohntextilien.",
      ar: "أقمشة قوية وذات ملمس فاخر مخصصة لخبراء الديكور ومستلزمات المنزل ووسائد الأريكة والمفروشات الراقية."
    }
  },
  "kain-merchandise-banner": {
    title: {
      en: "Merchandise, Event Flags & Display Promotional Fabrics",
      zh: "周边衍生品、活动旗帜与展会宣传面料",
      ja: "グッズ・イベント旗・プロモーション用昇華プリント生地",
      de: "Merchandise-, Eventflaggen- & Werbetextilien für Sublimation",
      ar: "أقمشة المقتنيات الترويجية ورايات الفعاليات وأكشاك المعارض"
    },
    intro: {
      en: "High-durability textiles created for corporate branding, stadium banners, event flags, duffle bags, and souvenir promotional products.",
      zh: "专为企业品牌展示、体育场横幅、展会旗帜、旅行背包及文创纪念周边打造的高耐久功能面料系列。",
      ja: "企業のブランディンググッズ、スタジアム幕、イベント旗、バックパック向けの高耐久テキスタイル。",
      de: "Hochbelastbare Textilien für Unternehmens-Branding, Stadionbanner, Werbeflaggen, Reisetaschen und Souvenirs.",
      ar: "أقمشة عالية المتانة مصممة للعلامات التجارية للشركات والرايات الإعلانية وأعلام الفعاليات وحقائب السفر والمقتنيات التذكارية."
    }
  }
};

const LOCALES = ["en", "zh", "ja", "de", "ar"];

async function main() {
  console.log("=== MEMULAI SEEDING TERJEMAHAN 5 BAHASA ===");
  let count = 0;

  // 1. Products
  const products = await prisma.fabricProduct.findMany({ select: { slug: true, description: true } });
  for (const p of products) {
    if (!p.description) continue;
    const trans = PRODUCT_TRANSLATIONS[p.slug];
    if (!trans) continue;
    for (const locale of LOCALES) {
      if (trans[locale]) {
        await prisma.contentTranslation.upsert({
          where: { entity_entityId_field_locale: { entity: "product", entityId: p.slug, field: "description", locale } },
          create: { entity: "product", entityId: p.slug, field: "description", locale, source: p.description, translation: trans[locale] },
          update: { source: p.description, translation: trans[locale] }
        });
        count++;
      }
    }
  }
  console.log("  [+] Selesai seeding produk.");

  // 2. FAQs
  const faqs = await prisma.faqItem.findMany({ select: { id: true, question: true, answer: true } });
  for (const f of faqs) {
    const trans = FAQ_TRANSLATIONS[f.id];
    if (!trans) continue;
    for (const locale of LOCALES) {
      if (trans.q?.[locale]) {
        await prisma.contentTranslation.upsert({
          where: { entity_entityId_field_locale: { entity: "faq", entityId: f.id, field: "question", locale } },
          create: { entity: "faq", entityId: f.id, field: "question", locale, source: f.question, translation: trans.q[locale] },
          update: { source: f.question, translation: trans.q[locale] }
        });
        count++;
      }
      if (trans.a?.[locale]) {
        await prisma.contentTranslation.upsert({
          where: { entity_entityId_field_locale: { entity: "faq", entityId: f.id, field: "answer", locale } },
          create: { entity: "faq", entityId: f.id, field: "answer", locale, source: f.answer, translation: trans.a[locale] },
          update: { source: f.answer, translation: trans.a[locale] }
        });
        count++;
      }
    }
  }
  console.log("  [+] Selesai seeding FAQ.");

  // 3. Hero Slides
  const heroes = await prisma.heroSlide.findMany({ select: { id: true, tag: true, caption: true, alt: true } });
  for (const h of heroes) {
    const trans = HERO_TRANSLATIONS[h.id];
    if (!trans) continue;
    for (const locale of LOCALES) {
      for (const field of ["tag", "caption", "alt"]) {
        if (trans[field]?.[locale] && h[field]) {
          await prisma.contentTranslation.upsert({
            where: { entity_entityId_field_locale: { entity: "hero", entityId: h.id, field, locale } },
            create: { entity: "hero", entityId: h.id, field, locale, source: h[field], translation: trans[field][locale] },
            update: { source: h[field], translation: trans[field][locale] }
          });
          count++;
        }
      }
    }
  }
  console.log("  [+] Selesai seeding Hero Slides.");

  // 4. Testimonials
  const testis = await prisma.testimonial.findMany({ select: { id: true, quote: true } });
  for (const t of testis) {
    const trans = TESTIMONIAL_TRANSLATIONS[t.id];
    if (!trans) continue;
    for (const locale of LOCALES) {
      if (trans[locale] && t.quote) {
        await prisma.contentTranslation.upsert({
          where: { entity_entityId_field_locale: { entity: "testimonial", entityId: t.id, field: "quote", locale } },
          create: { entity: "testimonial", entityId: t.id, field: "quote", locale, source: t.quote, translation: trans[locale] },
          update: { source: t.quote, translation: trans[locale] }
        });
        count++;
      }
    }
  }
  console.log("  [+] Selesai seeding Testimoni.");

  // 5. Site Content (CTA, Stats, Pages)
  for (const locale of LOCALES) {
    // CTA
    const cta = SITE_CONTENT_TRANSLATIONS["homepage.cta_b2b"];
    await prisma.contentTranslation.upsert({
      where: { entity_entityId_field_locale: { entity: "siteContent", entityId: "homepage.cta_b2b", field: "title", locale } },
      create: { entity: "siteContent", entityId: "homepage.cta_b2b", field: "title", locale, source: "Butuh pasokan rutin di atas 5.000 meter per bulan?", translation: cta.title[locale] },
      update: { translation: cta.title[locale] }
    });
    await prisma.contentTranslation.upsert({
      where: { entity_entityId_field_locale: { entity: "siteContent", entityId: "homepage.cta_b2b", field: "description", locale } },
      create: { entity: "siteContent", entityId: "homepage.cta_b2b", field: "description", locale, source: "Tersedia termin pembayaran 30/60 hari untuk mitra terverifikasi, sampel swatch, dan PIC sales khusus.", translation: cta.description[locale] },
      update: { translation: cta.description[locale] }
    });
    await prisma.contentTranslation.upsert({
      where: { entity_entityId_field_locale: { entity: "siteContent", entityId: "homepage.cta_b2b", field: "actionText", locale } },
      create: { entity: "siteContent", entityId: "homepage.cta_b2b", field: "actionText", locale, source: "Minta penawaran", translation: cta.actionText[locale] },
      update: { translation: cta.actionText[locale] }
    });
    count += 3;

    // Stats
    const stats = SITE_CONTENT_TRANSLATIONS["homepage.stats"];
    for (let i = 0; i < stats.length; i++) {
      const orig = i === 0 ? "Kapasitas harian" : i === 1 ? "Kain siap sublim" : "Mitra garmen";
      await prisma.contentTranslation.upsert({
        where: { entity_entityId_field_locale: { entity: "siteContent", entityId: `homepage.stats:${i}`, field: "k", locale } },
        create: { entity: "siteContent", entityId: `homepage.stats:${i}`, field: "k", locale, source: orig, translation: stats[i].k[locale] },
        update: { translation: stats[i].k[locale] }
      });
      count++;
    }

    // Pages
    const pages = SITE_CONTENT_TRANSLATIONS["site.pages"];
    for (const field of ["aboutTitle", "aboutDescription", "aboutCaption"]) {
      const orig = field === "aboutTitle" ? "Tentang PT. Texora Visi Prima" : field === "aboutDescription" ? "Pabrik tekstil dan jasa cetak sublimasi digital industri terpercaya di Jakarta Utara." : "Kualitas tekstil standar ekspor OEKO-TEX untuk mitra industri fesyen dan sportswear.";
      await prisma.contentTranslation.upsert({
        where: { entity_entityId_field_locale: { entity: "siteContent", entityId: "site.pages", field, locale } },
        create: { entity: "siteContent", entityId: "site.pages", field, locale, source: orig, translation: pages[field][locale] },
        update: { translation: pages[field][locale] }
      });
      count++;
    }
  }
  console.log("  [+] Selesai seeding Site Content.");

  // 6. SEO Pages
  for (const [path, trans] of Object.entries(SEO_META_TRANSLATIONS)) {
    const origTitle = path === "/" ? "Pabrik Kain Sublimasi & Tekstil Industri | Texora" : path === "/catalog" ? "Katalog Kain Sublimasi & Tekstil Industri | Texora" : path === "/about" ? "Tentang Kami — Pabrik Sublimasi Jakarta | Texora" : path === "/contact" ? "Hubungi Kami — Konsultasi Kain Sublimasi B2B | Texora" : path === "/custom-sublimation" ? "Studio Kustom Sublimasi — Visualizer Motif | Texora" : "Kategori Kain Sublimasi — Panduan & Katalog | Texora";
    const origDesc = path === "/" ? "Manufaktur kain poliester dan cetak sublimasi skala industri di Jakarta Utara. Katalog kain siap sublimasi, harga grosir bertingkat, visualizer motif kustom, dan portal B2B terintegrasi." : "Katalog lengkap kain poliester siap sublimasi: Dryfit Milano, Voal Ultrafine, Canvas, Scuba, Oxford, dan lainnya.";
    for (const locale of LOCALES) {
      if (trans.title?.[locale]) {
        await prisma.contentTranslation.upsert({
          where: { entity_entityId_field_locale: { entity: "seoMeta", entityId: path, field: "title", locale } },
          create: { entity: "seoMeta", entityId: path, field: "title", locale, source: origTitle, translation: trans.title[locale] },
          update: { translation: trans.title[locale] }
        });
        count++;
      }
      if (trans.description?.[locale]) {
        await prisma.contentTranslation.upsert({
          where: { entity_entityId_field_locale: { entity: "seoMeta", entityId: path, field: "description", locale } },
          create: { entity: "seoMeta", entityId: path, field: "description", locale, source: origDesc, translation: trans.description[locale] },
          update: { translation: trans.description[locale] }
        });
        count++;
      }
    }
  }
  console.log("  [+] Selesai seeding SEO Metadata.");

  // 7. Category SEO
  for (const [slug, trans] of Object.entries(CATEGORY_SEO_TRANSLATIONS)) {
    const origTitle = slug === "kain-sportswear" ? "Kain Sportswear & Jersey Sublimasi" : slug === "kain-hijab-fashion" ? "Kain Voal & Hijab Fashion Sublimasi" : slug === "kain-home-living" ? "Kain Home Living & Dekorasi Sublimasi" : "Kain Merchandise, Banner & Flag Event";
    const origIntro = "Koleksi kain premium siap sublimasi untuk kebutuhan industri dan fesyen.";
    for (const locale of LOCALES) {
      if (trans.title?.[locale]) {
        await prisma.contentTranslation.upsert({
          where: { entity_entityId_field_locale: { entity: "categorySeo", entityId: slug, field: "title", locale } },
          create: { entity: "categorySeo", entityId: slug, field: "title", locale, source: origTitle, translation: trans.title[locale] },
          update: { translation: trans.title[locale] }
        });
        count++;
      }
      if (trans.intro?.[locale]) {
        await prisma.contentTranslation.upsert({
          where: { entity_entityId_field_locale: { entity: "categorySeo", entityId: slug, field: "intro", locale } },
          create: { entity: "categorySeo", entityId: slug, field: "intro", locale, source: origIntro, translation: trans.intro[locale] },
          update: { translation: trans.intro[locale] }
        });
        count++;
      }
    }
  }
  console.log("  [+] Selesai seeding Category SEO.");

  console.log(`\n=== BERHASIL SEEDING TOTAL ${count} BARIS TERJEMAHAN! ===`);
}

main()
  .catch((e) => {
    console.error("Gagal seeding terjemahan:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
