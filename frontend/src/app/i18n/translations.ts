export type Locale = 'th' | 'en';

export const TRANSLATIONS = {
  th: {
    'nav.home': 'หน้าแรก',
    'nav.rods': 'เบ็ด',
    'nav.fish': 'ปลา',
    'lang.aria': 'ภาษา',

    'dashboard.subtitle':
      'ติดตามความคืบหน้า Rod Journal และ Bestiary สำหรับเบ็ด Masterline Rod',
    'dashboard.loading': 'กำลังโหลดข้อมูล...',
    'dashboard.total': 'รวมทั้งหมด',
    'dashboard.viewRods': 'รายการเบ็ด',
    'dashboard.viewFish': 'รายการปลา',
    'dashboard.copyLink': 'คัดลอก Share Link',
    'dashboard.copied': 'คัดลอกแล้ว!',
    'dashboard.wikiUpdated': 'ข้อมูล Wiki อัปเดตล่าสุด:',
    'dashboard.saving': 'กำลังบันทึก...',

    'fish.subtitle':
      'ปลาที่ต้องมีสำหรับ Masterline Rod (ยกเว้น Secret, Apex, Divine Secret, Limited)',
    'rods.subtitle':
      'เบ็ดที่ต้องมีสำหรับ Masterline Rod (ยกเว้น Brick, Crew, Dave และ limited-time)',
    'progress.label': 'ความคืบหน้า',
    'filter.noResults': 'ไม่พบรายการที่ตรงกับ filter',

    'filter.status': 'สถานะ',
    'filter.statusAll': 'ทั้งหมด',
    'filter.statusChecked': 'มีแล้ว',
    'filter.statusUnchecked': 'ยังไม่มี',
    'filter.category': 'หมวดหมู่',
    'filter.categoryAll': 'ทั้งหมด',
    'filter.search': 'ค้นหา',
    'filter.searchPlaceholder': 'ชื่อ...',
    'filter.hideCompleteZones': 'ซ่อนโซนที่ครบแล้ว',
    'filter.hideCheckedFish': 'ซ่อนปลาที่มีแล้ว',
    'filter.hideCheckedRods': 'ซ่อนเบ็ดที่มีแล้ว',

    'table.name': 'ชื่อ',
    'table.details': 'รายละเอียด',
    'checklist.checkAll': 'ติ๊กทั้งหมด',
    'checklist.checkItem': 'ติ๊ก {name}',
    'checklist.confirmMessage':
      'ติ๊กทั้งหมดในหมวด «{title}» ({count} รายการ) ใช่ไหม?',

    'confirm.title': 'ยืนยัน',
    'confirm.confirm': 'ยืนยัน',
    'confirm.cancel': 'ยกเลิก',

    'fishDetail.bait': 'Bait:',
    'common.openWiki': 'เปิด Wiki: {name}',

    'error.progressLoad':
      'โหลด progress ไม่สำเร็จ — ใช้งาน offline ชั่วคราว',
    'error.progressSave': 'บันทึก progress ไม่สำเร็จ',
    'error.catalogLoad': 'โหลดข้อมูล catalog ไม่สำเร็จ',

    'season.minimize': 'ย่อตัวติดตามฤดูกาล',
    'season.expand': 'ขยายตัวติดตามฤดูกาล',
    'season.current': 'ฤดูกาลปัจจุบัน',
    'season.upcoming': 'ฤดูกาลถัดไป',
    'season.other': 'ฤดูกาลอื่น',
    'season.endsIn': 'เหลืออีก',
    'season.more': 'เพิ่มเติม',
    'season.collapse': 'ย่อ',
    'season.ends': 'สิ้นสุด',
    'season.starts': 'เริ่ม',
  },
  en: {
    'nav.home': 'Home',
    'nav.rods': 'Rods',
    'nav.fish': 'Fish',
    'lang.aria': 'Language',

    'dashboard.subtitle':
      'Track Rod Journal and Bestiary progress for the Masterline Rod',
    'dashboard.loading': 'Loading data...',
    'dashboard.total': 'Total',
    'dashboard.viewRods': 'Rod Journal',
    'dashboard.viewFish': 'Fish Bestiary',
    'dashboard.copyLink': 'Copy Share Link',
    'dashboard.copied': 'Copied!',
    'dashboard.wikiUpdated': 'Wiki data last updated:',
    'dashboard.saving': 'Saving...',

    'fish.subtitle':
      'Fish required for the Masterline Rod (excluding Secret, Apex, Divine Secret, Limited)',
    'rods.subtitle':
      'Rods required for the Masterline Rod (excluding Brick, Crew, Dave, and limited-time)',
    'progress.label': 'Progress',
    'filter.noResults': 'No items match the current filters',

    'filter.status': 'Status',
    'filter.statusAll': 'All',
    'filter.statusChecked': 'Checked',
    'filter.statusUnchecked': 'Unchecked',
    'filter.category': 'Category',
    'filter.categoryAll': 'All',
    'filter.search': 'Search',
    'filter.searchPlaceholder': 'Name...',
    'filter.hideCompleteZones': 'Hide completed zones',
    'filter.hideCheckedFish': 'Hide checked fish',
    'filter.hideCheckedRods': 'Hide checked rods',

    'table.name': 'Name',
    'table.details': 'Details',
    'checklist.checkAll': 'Check all',
    'checklist.checkItem': 'Check {name}',
    'checklist.confirmMessage':
      'Check all items in "{title}" ({count} items)?',

    'confirm.title': 'Confirm',
    'confirm.confirm': 'Confirm',
    'confirm.cancel': 'Cancel',

    'fishDetail.bait': 'Bait:',
    'common.openWiki': 'Open wiki: {name}',

    'error.progressLoad':
      'Failed to load progress — using offline mode temporarily',
    'error.progressSave': 'Failed to save progress',
    'error.catalogLoad': 'Failed to load catalog data',

    'season.minimize': 'Minimize season tracker',
    'season.expand': 'Expand season tracker',
    'season.current': 'Current season',
    'season.upcoming': 'Upcoming seasons',
    'season.other': 'Other seasons',
    'season.endsIn': 'Ends in',
    'season.more': 'More',
    'season.collapse': 'Collapse',
    'season.ends': 'ends',
    'season.starts': 'starts',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.th;
