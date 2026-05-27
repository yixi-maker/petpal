import { prisma } from '@/lib/prisma';

interface MockPlace {
  name: string;
  type: string;
  city: string;
  district: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  rating: number;
  isOpen: boolean;
  openHours: string;
  petFriendlyTags: string[];
  images: string[];
}

interface MockReview {
  rating: number;
  content: string;
}

const PLACES: MockPlace[] = [
  // ===== 北京 (12 places) =====
  {
    name: '宠爱国际动物医院(朝阳总院)',
    type: 'HOSPITAL',
    city: '北京',
    district: '朝阳区',
    lat: 39.9219,
    lng: 116.4432,
    address: '朝阳区朝阳大悦城南侧底商2层',
    phone: '010-85761234',
    rating: 4.8,
    isOpen: true,
    openHours: '09:00-21:00',
    petFriendlyTags: ['可带宠入内', '24小时急诊', '免费初诊'],
    images: [],
  },
  {
    name: '爱达斯动物医院(海淀分院)',
    type: 'HOSPITAL',
    city: '北京',
    district: '海淀区',
    lat: 39.9835,
    lng: 116.3055,
    address: '海淀区中关村南大街12号院1号楼底商',
    phone: '010-62805788',
    rating: 4.5,
    isOpen: true,
    openHours: '09:00-20:00',
    petFriendlyTags: ['可带宠入内', '专科诊疗', '宠物体检'],
    images: [],
  },
  {
    name: '朝阳公园',
    type: 'PARK',
    city: '北京',
    district: '朝阳区',
    lat: 39.9375,
    lng: 116.4736,
    address: '朝阳区朝阳公园南路1号',
    phone: '010-65953696',
    rating: 4.6,
    isOpen: true,
    openHours: '06:00-21:00',
    petFriendlyTags: ['超大草坪', '宠物专属区域', '提供饮水'],
    images: [],
  },
  {
    name: '奥林匹克森林公园',
    type: 'PARK',
    city: '北京',
    district: '朝阳区',
    lat: 40.0180,
    lng: 116.3915,
    address: '朝阳区科荟路33号',
    phone: '010-64529060',
    rating: 4.7,
    isOpen: true,
    openHours: '06:00-20:00',
    petFriendlyTags: ['超大草坪', '跑步友好', '提供饮水'],
    images: [],
  },
  {
    name: '颐和园',
    type: 'PARK',
    city: '北京',
    district: '海淀区',
    lat: 39.9994,
    lng: 116.2755,
    address: '海淀区新建宫门路19号',
    phone: '010-62881144',
    rating: 4.9,
    isOpen: true,
    openHours: '06:30-18:00',
    petFriendlyTags: ['超大草坪', '景区级环境'],
    images: [],
  },
  {
    name: '三里屯太古里',
    type: 'MALL',
    city: '北京',
    district: '朝阳区',
    lat: 39.9337,
    lng: 116.4555,
    address: '朝阳区三里屯路19号',
    phone: '010-64176110',
    rating: 4.4,
    isOpen: true,
    openHours: '10:00-22:00',
    petFriendlyTags: ['可带宠入内', '宠物推车租赁', '提供饮水'],
    images: [],
  },
  {
    name: '国贸商城',
    type: 'MALL',
    city: '北京',
    district: '朝阳区',
    lat: 39.9089,
    lng: 116.4607,
    address: '朝阳区建国门外大街1号',
    phone: '010-65056699',
    rating: 4.3,
    isOpen: true,
    openHours: '10:00-21:30',
    petFriendlyTags: ['可带宠入内', '宠物友好电梯'],
    images: [],
  },
  {
    name: '胡同猫咖啡馆',
    type: 'CAFE',
    city: '北京',
    district: '东城区',
    lat: 39.9380,
    lng: 116.4074,
    address: '东城区南锣鼓巷118号',
    phone: '010-64012233',
    rating: 4.6,
    isOpen: true,
    openHours: '10:00-21:00',
    petFriendlyTags: ['可带宠入内', '猫咪主题', '宠物零食'],
    images: [],
  },
  {
    name: '京味烤鸭店(王府井店)',
    type: 'RESTAURANT',
    city: '北京',
    district: '东城区',
    lat: 39.9152,
    lng: 116.4105,
    address: '东城区王府井大街138号',
    phone: '010-65288888',
    rating: 4.5,
    isOpen: true,
    openHours: '11:00-21:30',
    petFriendlyTags: ['可带宠入内', '户外座位', '提供饮水'],
    images: [],
  },
  {
    name: '萌爪宠物洗护(望京店)',
    type: 'GROOMING',
    city: '北京',
    district: '朝阳区',
    lat: 40.0020,
    lng: 116.4808,
    address: '朝阳区望京街9号望京国际中心B1',
    phone: '010-84728899',
    rating: 4.7,
    isOpen: true,
    openHours: '10:00-20:00',
    petFriendlyTags: ['可带宠入内', 'SPA护理', '专业美容'],
    images: [],
  },
  {
    name: '旺旺宠物乐园(通州店)',
    type: 'BOARDING',
    city: '北京',
    district: '通州区',
    lat: 39.9053,
    lng: 116.6578,
    address: '通州区梨园镇云景东路88号',
    phone: '010-81547890',
    rating: 4.4,
    isOpen: true,
    openHours: '08:00-20:00',
    petFriendlyTags: ['可带宠入内', '寄养服务', '24小时监控', '遛狗服务'],
    images: [],
  },
  {
    name: '爪爪宠物医院(西城分院)',
    type: 'HOSPITAL',
    city: '北京',
    district: '西城区',
    lat: 39.9130,
    lng: 116.3656,
    address: '西城区金融街广成街2号',
    phone: '010-66550088',
    rating: 4.5,
    isOpen: true,
    openHours: '09:00-20:00',
    petFriendlyTags: ['可带宠入内', '专科诊疗', '疫苗接种'],
    images: [],
  },

  // ===== 上海 (12 places) =====
  {
    name: '申普宠物医院(黄浦总院)',
    type: 'HOSPITAL',
    city: '上海',
    district: '黄浦区',
    lat: 31.2304,
    lng: 121.4737,
    address: '黄浦区徐家汇路555号',
    phone: '021-63288888',
    rating: 4.7,
    isOpen: true,
    openHours: '08:30-21:00',
    petFriendlyTags: ['可带宠入内', '24小时急诊', '免费初诊'],
    images: [],
  },
  {
    name: '小精灵动物医院(静安分院)',
    type: 'HOSPITAL',
    city: '上海',
    district: '静安区',
    lat: 31.2286,
    lng: 121.4476,
    address: '静安区南京西路1788号',
    phone: '021-62345678',
    rating: 4.6,
    isOpen: true,
    openHours: '09:00-20:00',
    petFriendlyTags: ['可带宠入内', '专科诊疗', '宠物体检'],
    images: [],
  },
  {
    name: '世纪公园',
    type: 'PARK',
    city: '上海',
    district: '浦东新区',
    lat: 31.2116,
    lng: 121.5465,
    address: '浦东新区锦绣路1001号',
    phone: '021-38769988',
    rating: 4.8,
    isOpen: true,
    openHours: '07:00-18:00',
    petFriendlyTags: ['超大草坪', '宠物专属区域', '提供饮水'],
    images: [],
  },
  {
    name: '徐汇滨江绿地',
    type: 'PARK',
    city: '上海',
    district: '徐汇区',
    lat: 31.1851,
    lng: 121.4546,
    address: '徐汇区龙腾大道',
    phone: '',
    rating: 4.8,
    isOpen: true,
    openHours: '全天开放',
    petFriendlyTags: ['超大草坪', '跑步友好', '宠物专属区域'],
    images: [],
  },
  {
    name: '迪士尼小镇',
    type: 'MALL',
    city: '上海',
    district: '浦东新区',
    lat: 31.1433,
    lng: 121.6567,
    address: '浦东新区川沙镇申迪北路753号',
    phone: '021-20998002',
    rating: 4.5,
    isOpen: true,
    openHours: '10:00-22:00',
    petFriendlyTags: ['可带宠入内', '宠物推车租赁', '提供饮水'],
    images: [],
  },
  {
    name: '静安嘉里中心',
    type: 'MALL',
    city: '上海',
    district: '静安区',
    lat: 31.2248,
    lng: 121.4498,
    address: '静安区南京西路1515号',
    phone: '021-62898899',
    rating: 4.4,
    isOpen: true,
    openHours: '10:00-22:00',
    petFriendlyTags: ['可带宠入内', '宠物友好电梯'],
    images: [],
  },
  {
    name: '猫的天空之城(武康路店)',
    type: 'CAFE',
    city: '上海',
    district: '徐汇区',
    lat: 31.2042,
    lng: 121.4393,
    address: '徐汇区武康路280号',
    phone: '021-64339988',
    rating: 4.6,
    isOpen: true,
    openHours: '10:00-20:30',
    petFriendlyTags: ['可带宠入内', '猫咪主题', '宠物零食', '书籍阅读'],
    images: [],
  },
  {
    name: '新元素餐厅(浦东嘉里店)',
    type: 'RESTAURANT',
    city: '上海',
    district: '浦东新区',
    lat: 31.2142,
    lng: 121.5380,
    address: '浦东新区花木路1378号嘉里城1楼',
    phone: '021-50338888',
    rating: 4.3,
    isOpen: true,
    openHours: '10:00-21:30',
    petFriendlyTags: ['可带宠入内', '户外座位', '提供饮水', '宠物菜单'],
    images: [],
  },
  {
    name: '咪咪宠物SPA馆(徐汇店)',
    type: 'GROOMING',
    city: '上海',
    district: '徐汇区',
    lat: 31.1906,
    lng: 121.4355,
    address: '徐汇区天钥桥路333号腾飞大厦2楼',
    phone: '021-64277788',
    rating: 4.8,
    isOpen: true,
    openHours: '10:00-21:00',
    petFriendlyTags: ['可带宠入内', 'SPA护理', '专业美容', '免费接送'],
    images: [],
  },
  {
    name: '宠物狗狗训练寄养中心(青浦)',
    type: 'BOARDING',
    city: '上海',
    district: '青浦区',
    lat: 31.1506,
    lng: 121.1242,
    address: '青浦区外青松公路6999号',
    phone: '021-59228899',
    rating: 4.5,
    isOpen: true,
    openHours: '08:00-19:00',
    petFriendlyTags: ['可带宠入内', '寄养服务', '24小时监控', '遛狗服务', '行为训练'],
    images: [],
  },
  {
    name: '魔都宠物市集(长宁店)',
    type: 'MALL',
    city: '上海',
    district: '长宁区',
    lat: 31.2204,
    lng: 121.4102,
    address: '长宁区虹桥路1665号星空广场B1',
    phone: '021-62195566',
    rating: 4.2,
    isOpen: true,
    openHours: '10:00-21:00',
    petFriendlyTags: ['可带宠入内', '宠物集市', '宠物摄影'],
    images: [],
  },
  {
    name: '汪汪宠物医院(闵行分院)',
    type: 'HOSPITAL',
    city: '上海',
    district: '闵行区',
    lat: 31.1128,
    lng: 121.3820,
    address: '闵行区七莘路1839号财富108广场1楼',
    phone: '021-54169988',
    rating: 4.4,
    isOpen: true,
    openHours: '09:00-20:00',
    petFriendlyTags: ['可带宠入内', '疫苗接种', '驱虫服务'],
    images: [],
  },

  // ===== 深圳 (12 places) =====
  {
    name: '瑞鹏宠物医院(南山总院)',
    type: 'HOSPITAL',
    city: '深圳',
    district: '南山区',
    lat: 22.5332,
    lng: 113.9507,
    address: '南山区科技园深圳湾科技生态园12栋',
    phone: '0755-86088888',
    rating: 4.7,
    isOpen: true,
    openHours: '09:00-21:00',
    petFriendlyTags: ['可带宠入内', '24小时急诊', '免费初诊'],
    images: [],
  },
  {
    name: '芭比堂动物医院(福田分院)',
    type: 'HOSPITAL',
    city: '深圳',
    district: '福田区',
    lat: 22.5431,
    lng: 114.0579,
    address: '福田区华强北街道深南中路2008号',
    phone: '0755-83630088',
    rating: 4.5,
    isOpen: true,
    openHours: '09:00-20:00',
    petFriendlyTags: ['可带宠入内', '专科诊疗', '宠物体检'],
    images: [],
  },
  {
    name: '深圳湾公园',
    type: 'PARK',
    city: '深圳',
    district: '南山区',
    lat: 22.5160,
    lng: 113.9500,
    address: '南山区滨海大道深圳湾公园',
    phone: '0755-83708888',
    rating: 4.9,
    isOpen: true,
    openHours: '06:00-23:00',
    petFriendlyTags: ['超大草坪', '海景', '跑步友好', '宠物专属区域'],
    images: [],
  },
  {
    name: '莲花山公园',
    type: 'PARK',
    city: '深圳',
    district: '福田区',
    lat: 22.5487,
    lng: 114.0595,
    address: '福田区红荔路6030号',
    phone: '0755-83067950',
    rating: 4.7,
    isOpen: true,
    openHours: '06:00-22:30',
    petFriendlyTags: ['超大草坪', '山景', '提供饮水'],
    images: [],
  },
  {
    name: '万象天地',
    type: 'MALL',
    city: '深圳',
    district: '南山区',
    lat: 22.5368,
    lng: 113.9567,
    address: '南山区深南大道9668号',
    phone: '0755-86688888',
    rating: 4.5,
    isOpen: true,
    openHours: '10:00-22:00',
    petFriendlyTags: ['可带宠入内', '宠物推车租赁', '提供饮水'],
    images: [],
  },
  {
    name: '壹方城',
    type: 'MALL',
    city: '深圳',
    district: '宝安区',
    lat: 22.5565,
    lng: 113.8832,
    address: '宝安区新湖路99号',
    phone: '0755-23000000',
    rating: 4.3,
    isOpen: true,
    openHours: '10:00-22:00',
    petFriendlyTags: ['可带宠入内', '宠物友好电梯'],
    images: [],
  },
  {
    name: '猫咖屋(华侨城店)',
    type: 'CAFE',
    city: '深圳',
    district: '南山区',
    lat: 22.5387,
    lng: 113.9820,
    address: '南山区华侨城创意园北区A3栋',
    phone: '0755-86270066',
    rating: 4.6,
    isOpen: true,
    openHours: '10:00-20:30',
    petFriendlyTags: ['可带宠入内', '猫咪主题', '宠物零食'],
    images: [],
  },
  {
    name: '海上世界(蛇口)',
    type: 'RESTAURANT',
    city: '深圳',
    district: '南山区',
    lat: 22.4846,
    lng: 113.9122,
    address: '南山区蛇口海上世界广场A区',
    phone: '0755-26838888',
    rating: 4.5,
    isOpen: true,
    openHours: '11:00-22:00',
    petFriendlyTags: ['可带宠入内', '户外座位', '提供饮水', '海景'],
    images: [],
  },
  {
    name: '萌宠造型馆(福田中心店)',
    type: 'GROOMING',
    city: '深圳',
    district: '福田区',
    lat: 22.5435,
    lng: 114.0605,
    address: '福田区福华三路星河COCO Park B1',
    phone: '0755-82835599',
    rating: 4.7,
    isOpen: true,
    openHours: '10:00-21:00',
    petFriendlyTags: ['可带宠入内', 'SPA护理', '专业美容', '免费接送'],
    images: [],
  },
  {
    name: '贝贝宠物寄养中心(龙华店)',
    type: 'BOARDING',
    city: '深圳',
    district: '龙华区',
    lat: 22.6572,
    lng: 114.0280,
    address: '龙华区民治街道民康路333号',
    phone: '0755-81880099',
    rating: 4.4,
    isOpen: true,
    openHours: '08:00-20:00',
    petFriendlyTags: ['可带宠入内', '寄养服务', '24小时监控', '遛狗服务'],
    images: [],
  },
  {
    name: '宠物帮帮洗护(宝安店)',
    type: 'GROOMING',
    city: '深圳',
    district: '宝安区',
    lat: 22.5666,
    lng: 113.8824,
    address: '宝安区西乡大道宝安大仟里2楼',
    phone: '0755-29990022',
    rating: 4.5,
    isOpen: true,
    openHours: '10:00-20:00',
    petFriendlyTags: ['可带宠入内', 'SPA护理', '专业美容'],
    images: [],
  },
  {
    name: '南山猫咪寄养小屋',
    type: 'BOARDING',
    city: '深圳',
    district: '南山区',
    lat: 22.5200,
    lng: 113.9350,
    address: '南山区前海路星海名城6期底商',
    phone: '0755-86551188',
    rating: 4.6,
    isOpen: true,
    openHours: '09:00-21:00',
    petFriendlyTags: ['可带宠入内', '寄养服务', '猫咪专属', '24小时监控'],
    images: [],
  },
];

const REVIEWS: Record<string, MockReview[]> = {
  // Beijing reviews
  '宠爱国际动物医院(朝阳总院)': [
    { rating: 5, content: '医生很专业，对狗狗特别温柔，环境也很干净' },
    { rating: 4, content: '服务态度好，就是价格略贵，总体值得推荐' },
    { rating: 5, content: '半夜急诊也非常及时，救了我家猫咪一命' },
  ],
  '爱达斯动物医院(海淀分院)': [
    { rating: 4, content: '离学校近，带宠物看病方便' },
    { rating: 5, content: '兽医小姐姐超温柔，还会送小零食' },
  ],
  '朝阳公园': [
    { rating: 5, content: '周末遛狗圣地！草坪超大，狗狗玩得超开心' },
    { rating: 4, content: '宠物区不收费，就是停车位不太好找' },
    { rating: 5, content: '遇到了好多狗友，社交好去处' },
  ],
  '奥林匹克森林公园': [
    { rating: 5, content: '北园很适合遛狗，人少狗多' },
    { rating: 4, content: '环境超棒，就是离地铁站有点远' },
  ],
  '颐和园': [
    { rating: 5, content: '带狗狗逛皇家园林，太惬意了' },
    { rating: 5, content: '世界文化遗产级别的遛狗体验' },
  ],
  '三里屯太古里': [
    { rating: 4, content: '很多店都可以带狗进去，宠物推车也可以租' },
    { rating: 5, content: '潮流人士和潮流狗狗的聚集地' },
  ],
  '国贸商城': [
    { rating: 4, content: '高端商场，宠物也享受VIP待遇' },
    { rating: 3, content: '部分区域限制宠物，需要注意标识' },
  ],
  '胡同猫咖啡馆': [
    { rating: 5, content: '猫猫天堂！可以边喝咖啡边撸猫' },
    { rating: 4, content: '猫咪都很亲人，环境也很北京' },
  ],
  '京味烤鸭店(王府井店)': [
    { rating: 5, content: '可以带着狗子一起吃烤鸭，还有专门的宠物饮水区' },
    { rating: 4, content: '户外座位很舒服，宠物友好做得不错' },
  ],
  '萌爪宠物洗护(望京店)': [
    { rating: 5, content: '洗得很干净，还送了个小围脖' },
    { rating: 4, content: '美容师很耐心，宝贝很开心' },
  ],
  '旺旺宠物乐园(通州店)': [
    { rating: 4, content: '寄养了一周，每天都发视频，很放心' },
    { rating: 5, content: '场地很大，狗狗不会觉得闷' },
  ],
  '爪爪宠物医院(西城分院)': [
    { rating: 5, content: '全面体检很仔细，价格透明' },
    { rating: 4, content: '疫苗套餐很划算' },
  ],

  // Shanghai reviews
  '申普宠物医院(黄浦总院)': [
    { rating: 5, content: '上海最好的宠物医院之一，设备先进' },
    { rating: 4, content: '急诊很及时，就是人有点多需要排队' },
    { rating: 5, content: '医生的诊断很准确，少走了很多弯路' },
  ],
  '小精灵动物医院(静安分院)': [
    { rating: 5, content: '服务特别好，对宠物真的很有爱' },
    { rating: 4, content: '价格公道，推荐' },
  ],
  '世纪公园': [
    { rating: 5, content: '大草坪太适合狗子撒欢了' },
    { rating: 5, content: '每个周末都来，毛孩子最开心的地方' },
  ],
  '徐汇滨江绿地': [
    { rating: 5, content: '滨江散步超舒服，狗子喜欢看船' },
    { rating: 4, content: '跑步的人也很多，要牵好绳子' },
  ],
  '迪士尼小镇': [
    { rating: 4, content: '可以带宠物逛街，宠物推车好可爱' },
    { rating: 5, content: '氛围很好，拍照超出片' },
  ],
  '静安嘉里中心': [
    { rating: 4, content: '高端的宠物友好商场，体验不错' },
    { rating: 3, content: '宠物区域有点小，但整体还行' },
  ],
  '猫的天空之城(武康路店)': [
    { rating: 5, content: '文艺范十足，猫猫都很放松' },
    { rating: 4, content: '咖啡好喝，猫也可爱，完美的下午' },
  ],
  '新元素餐厅(浦东嘉里店)': [
    { rating: 4, content: '宠物菜单很有创意，狗子吃得很开心' },
    { rating: 5, content: '户外座位布置得很舒适' },
  ],
  '咪咪宠物SPA馆(徐汇店)': [
    { rating: 5, content: '洗完香喷喷，毛发超级顺滑' },
    { rating: 4, content: '免费接送太方便了' },
  ],
  '宠物狗狗训练寄养中心(青浦)': [
    { rating: 4, content: '寄养+训练一起，回来狗狗更乖了' },
    { rating: 5, content: '环境好，离市区远但很安静' },
  ],
  '魔都宠物市集(长宁店)': [
    { rating: 4, content: '宠物用品超全，一站式购物' },
    { rating: 3, content: '周末人多有点挤' },
  ],
  '汪汪宠物医院(闵行分院)': [
    { rating: 4, content: '离家近，常规疫苗都在这打' },
    { rating: 5, content: '医生很负责，后续还会电话回访' },
  ],

  // Shenzhen reviews
  '瑞鹏宠物医院(南山总院)': [
    { rating: 5, content: '深圳最好的宠物医院，没有之一' },
    { rating: 4, content: '设备很新，医生技术也好' },
    { rating: 5, content: '24小时急诊救了宝贝的命，感恩' },
  ],
  '芭比堂动物医院(福田分院)': [
    { rating: 4, content: '服务不错，价格合理' },
    { rating: 5, content: '医生态度好，解释得很详细' },
  ],
  '深圳湾公园': [
    { rating: 5, content: '海边遛狗太美了，还能看日出' },
    { rating: 5, content: '深圳跑狗天花板' },
    { rating: 5, content: '每次狗子都玩到不想回家' },
  ],
  '莲花山公园': [
    { rating: 4, content: '山顶风景好，适合遛狗锻炼' },
    { rating: 5, content: '草坪维护得很好，很干净' },
  ],
  '万象天地': [
    { rating: 5, content: '宠物友好度满分，室内空调遛狗' },
    { rating: 4, content: '夏天带狗子逛商场的好去处' },
  ],
  '壹方城': [
    { rating: 4, content: '宝安最大的宠物友好商场' },
    { rating: 3, content: '还可以，但人流量大' },
  ],
  '猫咖屋(华侨城店)': [
    { rating: 5, content: '创意园里的宝藏咖啡馆' },
    { rating: 4, content: '文艺气息满满，猫猫也很可爱' },
  ],
  '海上世界(蛇口)': [
    { rating: 5, content: '靠海的就餐体验，狗子也爱看海' },
    { rating: 4, content: '环境太棒了，就是离市区远了点' },
  ],
  '萌宠造型馆(福田中心店)': [
    { rating: 5, content: '造型师审美在线，每次都有新造型' },
    { rating: 4, content: '在商场里面很方便，逛完顺便接毛孩子' },
  ],
  '贝贝宠物寄养中心(龙华店)': [
    { rating: 4, content: '寄养了一周，回来状态不错' },
    { rating: 5, content: '监控随时可以看，很安心' },
  ],
  '宠物帮帮洗护(宝安店)': [
    { rating: 5, content: '洗得很认真，还会修剪指甲' },
    { rating: 4, content: '价格实惠，性价比高' },
  ],
  '南山猫咪寄养小屋': [
    { rating: 5, content: '猫咪专区很棒，不怕被狗吓到' },
    { rating: 4, content: '猫猫寄养很专业，环境也好' },
  ],
};

let seeded = false;

export async function seedPlaces(): Promise<void> {
  if (seeded) return;

  try {
    const count = await prisma.place.count();
    if (count > 0) {
      seeded = true;
      return;
    }
  } catch {
    // Table may not exist yet (e.g. during build), skip seeding
    return;
  }

  // First, find existing pets to use for reviews
  const existingPets = await prisma.pet.findMany({ take: 10, select: { id: true } });

  // If no pets exist, create some placeholder users and pets for review data
  if (existingPets.length === 0) {
    // Create a demo user
    let demoUser = await prisma.user.findUnique({ where: { phone: '13800000000' } });
    if (!demoUser) {
      demoUser = await prisma.user.create({
        data: {
          phone: '13800000000',
          nickname: 'Demo用户',
          agreementAccepted: true,
        },
      });
    }

    // Create demo pets
    const petCount = await prisma.pet.count({ where: { userId: demoUser.id } });
    if (petCount === 0) {
      await prisma.pet.createMany({
        data: [
          { userId: demoUser.id, name: '旺财', type: 'DOG', breed: '金毛' },
          { userId: demoUser.id, name: '咪咪', type: 'CAT', breed: '英短' },
          { userId: demoUser.id, name: '小白', type: 'DOG', breed: '萨摩耶' },
          { userId: demoUser.id, name: '小花', type: 'CAT', breed: '橘猫' },
        ],
      });
    }
  }

  // Re-fetch pets after possibly creating them
  const pets = await prisma.pet.findMany({ take: 10, select: { id: true } });
  const petIds = pets.map((p) => p.id);

  for (const placeData of PLACES) {
    const place = await prisma.place.create({
      data: {
        name: placeData.name,
        type: placeData.type,
        city: placeData.city,
        district: placeData.district,
        lat: placeData.lat,
        lng: placeData.lng,
        address: placeData.address,
        phone: placeData.phone,
        rating: placeData.rating,
        isOpen: placeData.isOpen,
        openHours: placeData.openHours,
        petFriendlyTags: JSON.stringify(placeData.petFriendlyTags),
        images: JSON.stringify(placeData.images),
        status: 'ACTIVE',
      },
    });

    // Create reviews for this place
    const placeReviews = REVIEWS[placeData.name] || [];
    for (let i = 0; i < placeReviews.length; i++) {
      const petId = petIds[i % petIds.length];
      await prisma.placeReview.create({
        data: {
          placeId: place.id,
          petId,
          rating: placeReviews[i].rating,
          content: placeReviews[i].content,
        },
      });
    }
  }

  seeded = true;
}

export async function getMockPlaces(city?: string, type?: string) {
  // Try to seed if DB is empty
  await seedPlaces();

  const where: Record<string, unknown> = { status: 'ACTIVE' };
  if (city) where.city = city;
  if (type) where.type = type;

  const places = await prisma.place.findMany({
    where,
    include: {
      _count: { select: { reviews: true } },
    },
    orderBy: { rating: 'desc' },
  });

  return places.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    city: p.city,
    district: p.district,
    lat: p.lat,
    lng: p.lng,
    address: p.address,
    phone: p.phone,
    rating: p.rating,
    isOpen: p.isOpen,
    openHours: p.openHours,
    petFriendlyTags: JSON.parse(p.petFriendlyTags || '[]'),
    images: JSON.parse(p.images || '[]'),
    reviewCount: p._count.reviews,
  }));
}
