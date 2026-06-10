export interface CostItem {
  code: string | number; name: string; category: string; subCategory: string
  unit: string | number; price: number; supplier: string; location: string; payment: string
}
export interface CostSupplier {
  name: string; itemCount: number; categories: string[]; locations: string[]
}
export interface WastageItem {
  name: string; unit: string; qty: number; waste: number
  wastePct: number; pricePerKg: number; finalPrice: number
}

export const COST_ITEMS: CostItem[] = [
  {
    "code": "1f0c41",
    "name": "Mineral Water 330ml ( 40 PCS )",
    "category": "SOFT DRINKS",
    "subCategory": "WATER",
    "unit": "Piece",
    "price": 8.25,
    "supplier": "موسسه عذوب للمياه والمرطبات",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "47b6c2",
    "name": "Peeled pumpkin seeds",
    "category": "DAIRY PRODUCTS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 24,
    "supplier": "موسسه راغب مصطفي الشنواني للتجاره",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "e8d732",
    "name": "FRENCH FRIES 9X9 - ( 10 KG )",
    "category": "DRY ITEMS",
    "subCategory": "OTHER DRY ITEMS",
    "unit": "Kg",
    "price": 53,
    "supplier": "شركه محمود نشار وشركائه",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "f7ae6c",
    "name": "dates - 1KG",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 5,
    "supplier": "شركه تمور الاحمدية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "0af6c2",
    "name": "AREEN FROZEN EGG MIX - 5KG",
    "category": "DAIRY PRODUCTS",
    "subCategory": "EGGS",
    "unit": "L",
    "price": 45,
    "supplier": "شركة مصنع الفا العالميه للصناعات الغذائيه",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "fe81ad",
    "name": "COFFE BAG WHITE 250GM -300 PCS",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 157,
    "supplier": "شركة سهم المصدر للتجاره",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "cef7d8",
    "name": "SESAME WHITE",
    "category": "DRY ITEMS",
    "subCategory": "GRAINS",
    "unit": "Kg",
    "price": 10.43,
    "supplier": "رياحين الشام",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "d6d743",
    "name": "sunflower seed",
    "category": "DRY ITEMS",
    "subCategory": "GRAINS",
    "unit": "Kg",
    "price": 13.5,
    "supplier": "رياحين الشام",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "6328d1",
    "name": "flex seed",
    "category": "DRY ITEMS",
    "subCategory": "GRAINS",
    "unit": "Kg",
    "price": 13.22,
    "supplier": "رياحين الشام",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "7953ed",
    "name": "peanut",
    "category": "DRY ITEMS",
    "subCategory": "GRAINS",
    "unit": "Kg",
    "price": 9.5,
    "supplier": "رياحين الشام",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "e2668f",
    "name": "RED CHILI DRYIED - 800 G",
    "category": "DAIRY PRODUCTS",
    "subCategory": "DAIRY OTHERS",
    "unit": "g",
    "price": 28,
    "supplier": "رياحين الشام",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "0a58e9",
    "name": "chia seed- 1KG",
    "category": "DRY ITEMS",
    "subCategory": "OTHER DRY ITEMS",
    "unit": "Kg",
    "price": 21.73,
    "supplier": "رياحين الشام",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "0dd5de",
    "name": "BRAZILIAN STRIPLOIN BEEF",
    "category": "MEAT",
    "subCategory": "BEEF",
    "unit": "Kg",
    "price": 31,
    "supplier": "Wijhat Al Ghethaشركة واجهة الغذاء",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "9202dd",
    "name": "Top side",
    "category": "MEAT",
    "subCategory": "BEEF",
    "unit": "Kg",
    "price": 21.5,
    "supplier": "WIJHAT AJGETHA",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "006ef3",
    "name": "Potato sweet",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "FRUITS FRESH",
    "unit": "Kg",
    "price": 6.25,
    "supplier": "Top Fruits",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "1e778c",
    "name": "red paper",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 10,
    "supplier": "Top Fruits",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "a49fc7",
    "name": "POTATO",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 2.75,
    "supplier": "Top Fruits",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "9c06df",
    "name": "MARQUISE POTATO",
    "category": "SPICES",
    "subCategory": "",
    "unit": "KG",
    "price": 4.5,
    "supplier": "Top Fruits",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "9670a8",
    "name": "Mango",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "FRUITS FRESH",
    "unit": 10,
    "price": 12,
    "supplier": "Top Fruits",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "f05527",
    "name": "Pomegranate",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "FRUITS FRESH",
    "unit": "Kg",
    "price": 12,
    "supplier": "Top Fruits",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "12505f",
    "name": "Watermelon",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "FRUITS FRESH",
    "unit": "Kg",
    "price": 3.5,
    "supplier": "Top Fruits",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "d9519f",
    "name": "Green pepper",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 6,
    "supplier": "Top Fruits",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "93778b",
    "name": "Beetroots",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 4.5,
    "supplier": "Top Fruits",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "5713da",
    "name": "franch beans",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 14,
    "supplier": "Top Fruits",
    "location": "STUFF",
    "payment": ""
  },
  {
    "code": "bf5b76",
    "name": "bitter ground",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 6.5,
    "supplier": "Top Fruits",
    "location": "STUFF",
    "payment": ""
  },
  {
    "code": "2f016c",
    "name": "GREEN CHILI",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 12,
    "supplier": "Top Fruits",
    "location": "STUFF",
    "payment": ""
  },
  {
    "code": "16b92d",
    "name": "CURRY LEAVES",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 55,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "4e10cb",
    "name": "fig",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "FRUITS FRESH",
    "unit": "Kg",
    "price": 15.84,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "52c97b",
    "name": "Pineapple",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "FRUITS FRESH",
    "unit": "Kg",
    "price": 7.95,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": 8.5e+275,
    "name": "celery",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 19,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": 673514,
    "name": "curry leaves",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 55,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "78e9fe",
    "name": "basil",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Piece",
    "price": 12.75,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "8cbef8",
    "name": "dill ( 400 GM )",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 0.8,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "b47446",
    "name": "BIG PUMPKIN",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "FRUITS FRESH",
    "unit": "Kg",
    "price": 3,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "49b9cd",
    "name": "TOMATO CHERRY",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 28,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "e9c2bd",
    "name": "SPRING ONION",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Piece",
    "price": 0.9,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "aaa732",
    "name": "FUSHAK",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Piece",
    "price": 25,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "b1a37b",
    "name": "RED GRAPES",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "FRUITS FRESH",
    "unit": "Kg",
    "price": 14,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "605a39",
    "name": "WHITE GRAPES",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "FRUITS FRESH",
    "unit": "Kg",
    "price": 14,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "19e15e",
    "name": "KIWI",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "FRUITS FRESH",
    "unit": "Kg",
    "price": 14,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "a0f694",
    "name": "TOPIOCA",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 11,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "7ac4ab",
    "name": "DRUMGTLCK",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 15,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "74801c",
    "name": "DILL LEAVES",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Piece",
    "price": 1,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "61b9f1",
    "name": "APPLE GREEN",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "FRUITS FRESH",
    "unit": "Kg",
    "price": 6.75,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "9b8fec",
    "name": "zucchini",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 4.5,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "db124e",
    "name": "RED ONION",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 2.5,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "996d8b",
    "name": "snowwpcas",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 54,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "dfa995",
    "name": "Sweet melon",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "FRUITS FRESH",
    "unit": "Kg",
    "price": 6.5,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "77f677",
    "name": "KALE",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 38,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "eb9321",
    "name": "CUCUMBER - 3 KG",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 4,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "cd22e9",
    "name": "ROMAIN LETTUCE",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 4.75,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "ab9ec8",
    "name": "RED CABBAGGE",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 4.5,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "d074f4",
    "name": "CARROTS",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 2.88,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "4d6ed5",
    "name": "CABBAGGE WHITE",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 2.5,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "5ec940",
    "name": "ICEBERG LETTUCE",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 10,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "62196d",
    "name": "LIME",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 6.75,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "8e3aa2",
    "name": "ROCCA - 300 G",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "G",
    "price": 0.6,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "a461f9",
    "name": "FENUGREEK LEAVES",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 1,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "55cc8e",
    "name": "GINGER",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 6,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "d86108",
    "name": "TOMATO",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 4.5,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "ad674a",
    "name": "LEMON",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 5.95,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "c494c4",
    "name": "SPINACH",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 0.6,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "2f989a",
    "name": "MUSHROOM BROWN",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 34,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "5ce56c",
    "name": "HABAQ",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 0.6,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "ad6d46",
    "name": "GARLIC",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 6,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "cc0fd1",
    "name": "eggplant",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 3.25,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "13d564",
    "name": "ORANGE",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "FRUITS FRESH",
    "unit": "Kg",
    "price": 4,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "c27bcc",
    "name": "YELLOW ONION",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 0,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "01398d",
    "name": "MINT",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 0.6,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "586d3a",
    "name": "OKRA",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 10.5,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "b3d9f5",
    "name": "PARSLEY",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 0.6,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "cf1557",
    "name": "CORIANDER",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 0.6,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "2e7a96",
    "name": "BOTTLE GOURD",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 4.5,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "04db49",
    "name": "CAULIFLOWER",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 4,
    "supplier": "Top Fruits",
    "location": "",
    "payment": ""
  },
  {
    "code": "d541cb",
    "name": "ghawar regular samosas - 20 KG",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 160,
    "supplier": "TILAL GHAWAR FOR TRADING",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "279f69",
    "name": "sambosa chicken - ( 20 PKT x 30 PCS )",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Piece",
    "price": 240,
    "supplier": "TILAL GHAWAR FOR TRADING",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": 398742,
    "name": "sambosa creamy cheese - ( 20 PKT x 30 PCS )",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Piece",
    "price": 240,
    "supplier": "TILAL GHAWAR FOR TRADING",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "11f802",
    "name": "Cola Light 320ml - ( 12 PCS )",
    "category": "SOFT DRINKS",
    "subCategory": "SOFT DRINKS",
    "unit": "Piece",
    "price": 25.69,
    "supplier": "The Coca Cola Bottling Company",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "a37988",
    "name": "Cola 320ml - ( 24 PCS )",
    "category": "SOFT DRINKS",
    "subCategory": "SOFT DRINKS",
    "unit": "Piece",
    "price": 50.88,
    "supplier": "The Coca Cola Bottling Company",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "9f8a2e",
    "name": "Sprite 320ml ( 12 PCS )",
    "category": "SOFT DRINKS",
    "subCategory": "SOFT DRINKS",
    "unit": "Piece",
    "price": 25.69,
    "supplier": "The Coca Cola Bottling Company",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "2628f6",
    "name": "AREEN FROZEN EGG white 5 KG",
    "category": "DAIRY PRODUCTS",
    "subCategory": "EGGS",
    "unit": "Kg",
    "price": 60,
    "supplier": "TASTE DEVELOPMENT",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "b6f726",
    "name": "crab stick ( 12 X500G )",
    "category": "MEAT",
    "subCategory": "SEAFOOD",
    "unit": "g",
    "price": 150,
    "supplier": "TALAL ONE TRADING COMPANY",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "e4ae9e",
    "name": "PANKO BREAD CRUMBS",
    "category": "DRY ITEMS",
    "subCategory": "FLOUR",
    "unit": "Kg",
    "price": 19,
    "supplier": "TALAL ONE TRADING COMPANY",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "f8b06a",
    "name": "atlas date roll yellow",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 5,
    "supplier": "STAR TIME PLASTIC",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "ae4087",
    "name": "PESTO SAUCE -( 0.980 G )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "BTL",
    "price": 44,
    "supplier": "Sitaf company for trade",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "1d8ba3",
    "name": "TRUFFLE SAUCE - 0.5 KG",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "Kg",
    "price": 89.99,
    "supplier": "Sitaf company for trade",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "64f350",
    "name": "FARA HAZELNUT (12 X 12 X 1PCS )",
    "category": "Default Categories",
    "subCategory": "Uncategorized",
    "unit": "Piece",
    "price": 102,
    "supplier": "SAS ALKHER TRDING",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "b9e288",
    "name": "MINCED BEEF FOR BURGER - ( 4 PKT X 2 KG )",
    "category": "Default Categories",
    "subCategory": "Uncategorized",
    "unit": "Kg",
    "price": 184,
    "supplier": "SADIA",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "d6fdb6",
    "name": "KUWAIT ALL PURPOSE FLOUR - 10 KG",
    "category": "DRY ITEMS",
    "subCategory": "FLOUR",
    "unit": "Kg",
    "price": 39,
    "supplier": "SAAD FOR TRADING",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": 692031,
    "name": "FOOM PRIMUIM FLOUR - 10 KG",
    "category": "DRY ITEMS",
    "subCategory": "FLOUR",
    "unit": "Kg",
    "price": 16,
    "supplier": "SAAD FOR TRADING",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "cbcb73",
    "name": "TABASCO - ( 12 BTL X 0.350 ML )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "L",
    "price": 430,
    "supplier": "ORGANIZING IDEAS TRADING CO",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "c0002d",
    "name": "STEVIANA SUGER (250 g)",
    "category": "DRY ITEMS",
    "subCategory": "SUGARS",
    "unit": "g",
    "price": 12.083,
    "supplier": "NODA TRADING CO",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "3567d0",
    "name": "PEPPERONI SLICE - 10 KG",
    "category": "MEAT",
    "subCategory": "COLD CUTS",
    "unit": "Kg",
    "price": 242,
    "supplier": "National Food Company-Americana",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": 414309,
    "name": "CHICKEN BURGER CRISPY - 10 KG",
    "category": "MEAT",
    "subCategory": "POULTRY",
    "unit": "Kg",
    "price": 277,
    "supplier": "National Food Company-Americana",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "467d04",
    "name": "TURKEY SLICE - 10KG",
    "category": "MEAT",
    "subCategory": "COLD CUTS",
    "unit": "Kg",
    "price": 250,
    "supplier": "National Food Company-Americana",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "bbdf3b",
    "name": "CHICKEN STRIPS REGULAR - 10 KG",
    "category": "MEAT",
    "subCategory": "COLD CUTS",
    "unit": "Kg",
    "price": 266,
    "supplier": "National Food Company-Americana",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "37c090",
    "name": "HOT DOG - ( 24 X O.375 G )",
    "category": "DRY ITEMS",
    "subCategory": "OTHER DRY ITEMS",
    "unit": "Kg",
    "price": 192,
    "supplier": "National Food Company-Americana",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "5d1563",
    "name": "perrier water (24 x 200 ml )",
    "category": "SOFT DRINKS",
    "subCategory": "WATER",
    "unit": "mL",
    "price": 76.48,
    "supplier": "nakhal barari trading co.",
    "location": "salad",
    "payment": ""
  },
  {
    "code": 28567,
    "name": "couplet inverted sugar 80",
    "category": "DRY ITEMS",
    "subCategory": "SUGARS",
    "unit": "Kg",
    "price": 25,
    "supplier": "moltaqa alkhabbazeen",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "36dff7",
    "name": "kornqrain flour ( 10 KG )",
    "category": "DRY ITEMS",
    "subCategory": "FLOUR",
    "unit": "Kg",
    "price": 101,
    "supplier": "moltaqa alkhabbazeen",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "596eb6",
    "name": "Hand soap liquid - 30 LTR",
    "category": "MISCELLANEOUS",
    "subCategory": "CHEMICALS",
    "unit": "L",
    "price": 30,
    "supplier": "MAMSA TRADING",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "e76178",
    "name": "GARBAGE BAG - 10 KG",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Kg",
    "price": 42,
    "supplier": "MAMSA TRADING",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "5a040c",
    "name": "VINYL GLOVES POWDER FREE - ( 100 PKT X 70 PCS )",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 35,
    "supplier": "MAMSA TRADING",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "a7749a",
    "name": "MAXI ROLL 300m ( 6 ROLL)",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 40,
    "supplier": "MAMSA TRADING",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "a2238f",
    "name": "MADA ROLL - ( 200 PCS )",
    "category": "DRY ITEMS",
    "subCategory": "OTHER DRY ITEMS",
    "unit": "Piece",
    "price": 90,
    "supplier": "MAMSA TRADING",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "d2a762",
    "name": "PROTEIN POWDER",
    "category": "DRY ITEMS",
    "subCategory": "OTHER DRY ITEMS",
    "unit": "Kg",
    "price": 75,
    "supplier": "local purchase- متجر راكات",
    "location": "salad",
    "payment": ""
  },
  {
    "code": 4.88e+54,
    "name": "KRISPY RICE",
    "category": "DRY ITEMS",
    "subCategory": "OTHER DRY ITEMS",
    "unit": "Kg",
    "price": 13,
    "supplier": "local purchase",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "0074cd",
    "name": "coconut oil (1 litr )",
    "category": "LIQUID",
    "subCategory": "OIL",
    "unit": "L",
    "price": 13,
    "supplier": "local market",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "fc01f8",
    "name": "INK ROLL",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 5,
    "supplier": "HAMASA KHAYAL TRADING",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "b86b7b",
    "name": "AKAWI CHEESE",
    "category": "DAIRY PRODUCTS",
    "subCategory": "CHEESE",
    "unit": "Kg",
    "price": 20.22,
    "supplier": "Forsan Foods & Consumer Products Co Ltd",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "6f34af",
    "name": "WHITE CHEESE SLICE - SWISS - ( 8 X 2.270 KG )",
    "category": "DAIRY PRODUCTS",
    "subCategory": "CHEESE",
    "unit": "Kg",
    "price": 380,
    "supplier": "Forsan Foods & Consumer Products Co Ltd",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "4eee7e",
    "name": "YELLOW CHEESE SLICE - AMERICAN - ( 8 BLOCK X 2.270 KG )",
    "category": "DAIRY PRODUCTS",
    "subCategory": "CHEESE",
    "unit": "Kg",
    "price": 380,
    "supplier": "Forsan Foods & Consumer Products Co Ltd",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "9787fa",
    "name": "BRISKET BRAZILAN",
    "category": "MEAT",
    "subCategory": "BEEF",
    "unit": "Kg",
    "price": 19.5,
    "supplier": "Forsan Foods & Consumer Products Co Ltd",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "a796b5",
    "name": "CHUCK ROLL BRAZILIAN",
    "category": "MEAT",
    "subCategory": "BEEF",
    "unit": "Kg",
    "price": 19.5,
    "supplier": "Forsan Foods & Consumer Products Co Ltd",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "61c4df",
    "name": "board BEANS - 20 PKT X 500G )",
    "category": "DRY ITEMS",
    "subCategory": "CANNED FOODS",
    "unit": "g",
    "price": 145,
    "supplier": "food choice trading co",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "3f2ae8",
    "name": "ALGAMEL TAHINA - 10 LTR",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "L",
    "price": 105,
    "supplier": "Emtyaz wholesale company",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "36ccb3",
    "name": "BLUBERRY FROZEN - 1 KG",
    "category": "Default Categories",
    "subCategory": "Uncategorized",
    "unit": "g",
    "price": 30.5,
    "supplier": "Emtyaz wholesale company",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "99bef0",
    "name": "FROZEN STRAWBERRY - 1KG",
    "category": "Default Categories",
    "subCategory": "Uncategorized",
    "unit": "Kg",
    "price": 5.25,
    "supplier": "Emtyaz wholesale company",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "1e3f36",
    "name": "FRESHLY CAJUN SEASONING - 652G",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "g",
    "price": 48.83,
    "supplier": "Emtyaz wholesale company",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "bd745e",
    "name": "FRESHLY LEMON PEPPER SEASONING-425G",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "g",
    "price": 18.5,
    "supplier": "Emtyaz wholesale company",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "ac009b",
    "name": "KDD ORANGE JUCE",
    "category": "LIQUID",
    "subCategory": "SYRUPS",
    "unit": "L",
    "price": 6.95,
    "supplier": "Emtyaz wholesale company",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "09645f",
    "name": "SPONG STILL - 195 PCS",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 195,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "3ac826",
    "name": "PAPER CUP LID 12OZ - 1000 PCS",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 90,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "9c8ce2",
    "name": "FLAT MOP",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 55,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "1a95d7",
    "name": "CLOREX - 30 LTR",
    "category": "MISCELLANEOUS",
    "subCategory": "CHEMICALS",
    "unit": "L",
    "price": 65,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "ad221f",
    "name": "HAND SOAP P - 3- LTR",
    "category": "MISCELLANEOUS",
    "subCategory": "CHEMICALS",
    "unit": "L",
    "price": 45,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "c670d7",
    "name": "GLASS CLEANER 30L",
    "category": "MISCELLANEOUS",
    "subCategory": "CHEMICALS",
    "unit": "L",
    "price": 35,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "7484fe",
    "name": "Dustpan and broom",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 15,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "04b463",
    "name": "MOP COTTON SPARE",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 20,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "5a4dca",
    "name": "SOFT BROOM",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 15,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "c597b9",
    "name": "MICROFIBER COTTON",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 4,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "8fcfe3",
    "name": "JUICE CUP LID",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 0.04,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "9a6861",
    "name": "FORK WITH PLASTIC COVER - 1000 PCS",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 75,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "f89228",
    "name": "ARM SLEEVE - ( 20PKT x 100 PCS )",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 260,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "18836f",
    "name": "WET TISSUE WHITE - 1000 PCS",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 110,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "c57577",
    "name": "TERMAL ROLL - ( 100 PCS )",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 190,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "2ddbfd",
    "name": "HAIR NET WHITE - ( 10 PKT X 100 )",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 45,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "80baa2",
    "name": "FACE MASK BLACK - ( 40 PKT X 50 PCS )",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 140,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "7a8c81",
    "name": "CLING FILM cm - ( 6 ROLL - 45 CM )",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 110,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "aefc98",
    "name": "TABLE NAPKIN - ( 40 PKT X 100 )",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 55,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "00bae0",
    "name": "ROUND PAPER PLATE ( 1200 PCS )",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 90,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": 106691,
    "name": "DISH WASHING CHEMICAL - 30L",
    "category": "MISCELLANEOUS",
    "subCategory": "CHEMICALS",
    "unit": "L",
    "price": 35,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "0620a0",
    "name": "COFFEE STIRRER - ( 20 PKT X 500 )",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 120,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "d7c36e",
    "name": "DISHWASH FORM (SPONGE) - 180 PCS",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 95,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "3c5f04",
    "name": "APRON PLASTIC - ( 10 PKT X 100 PCS )",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 47,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "237dad",
    "name": "CARRY BAG SMALL PLASTIC - 15 KG",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Kg",
    "price": 75,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "a58087",
    "name": "GRILL CLEANER CHEMICAL ( 4 X 5L )",
    "category": "MISCELLANEOUS",
    "subCategory": "CHEMICALS",
    "unit": "L",
    "price": 55,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "5f5db0",
    "name": "FLOOR CLEANER CHEMICAL - 30 LTR",
    "category": "MISCELLANEOUS",
    "subCategory": "CHEMICALS",
    "unit": "L",
    "price": 35,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": 25041,
    "name": "LOCAL PAPER CUP",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 55,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "0990b4",
    "name": "JUICE CUP - 1000 PCS",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 155,
    "supplier": "Creative Gate",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "24857d",
    "name": "PLASTIC WHITE CUP 7 OZ - 1000 PCS",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 20,
    "supplier": "Creative Gate",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "a69f55",
    "name": "CUP HOLDER PULP TYPE (4) - 250 PCS",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 95,
    "supplier": "Creative Gate",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "a88651",
    "name": "FOIL WRAPPING PAPER - ( 4 PKT X 500 SHEET )",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 170,
    "supplier": "Creative Gate",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "63008b",
    "name": "TEA CUP 12OZ WHITE WITH LID - ( 1000 PCS WITH COVER )",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 370,
    "supplier": "Creative Gate",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "4dba40",
    "name": "BURGER PACKING PAPER 16x15x3 - ( 1000 PCS )",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 120,
    "supplier": "Creative Gate",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": 960352,
    "name": "SPOON WITH COVER -1000 PCS",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 70,
    "supplier": "Creative Gate",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "c4080a",
    "name": "GINGER POWDER - ( 6PCS - 16OZ)",
    "category": "DAIRY PRODUCTS",
    "subCategory": "DAIRY OTHERS",
    "unit": "oz",
    "price": 285,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "44d958",
    "name": "AMERICAN GARDEN GARLIC POWDER 454G",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "g",
    "price": 57,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "ec711a",
    "name": "BUR FLOUR (Brown ) - 45KG",
    "category": "DRY ITEMS",
    "subCategory": "FLOUR",
    "unit": "Kg",
    "price": 35,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "d3deae",
    "name": "SYRUP STRAWBERRY - ( 6 BTL X 0.700 ML )",
    "category": "LIQUID",
    "subCategory": "SYRUPS",
    "unit": "L",
    "price": 180,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "e738d3",
    "name": "Black straw 8m - ( 40 PKT X 250 PCS )",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 115,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "15c673",
    "name": "HONEY ALSHFA",
    "category": "DRY ITEMS",
    "subCategory": "CANNED FOODS",
    "unit": "Kg",
    "price": 33.83,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": 7.35e+59,
    "name": "GROUND CUMIN",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "Kg",
    "price": 8,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "1f242f",
    "name": "WHITE SUGAR STICK - 1000 PCS",
    "category": "DRY ITEMS",
    "subCategory": "SUGARS",
    "unit": "Kg",
    "price": 19.5,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "898f3a",
    "name": "SALT - ( 24 BTL X 0.750G )",
    "category": "DRY ITEMS",
    "subCategory": "SALT",
    "unit": "Kg",
    "price": 64,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "7de141",
    "name": "OREGANO LEAVES - ( 6 BTL - 142G )",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "Kg",
    "price": 115,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "1c853a",
    "name": "TOMATO KETCHUP SACHET - 1000 PCS",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "Kg",
    "price": 41,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "f67098",
    "name": "MILK ALMARAI - ( 12 PKT X 1 LTR )",
    "category": "DAIRY PRODUCTS",
    "subCategory": "MILK",
    "unit": "L",
    "price": 41,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "1d4e6e",
    "name": "HOT SAUCE - ( 4 GAL X 4.5 L )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "L",
    "price": 61,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "8cc020",
    "name": "JALAPENO - ( 4 GAL X 3.8 KG )",
    "category": "DRY ITEMS",
    "subCategory": "CANNED FOODS",
    "unit": "Kg",
    "price": 80,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": 892650,
    "name": "COOKING OIL - 17 LTR",
    "category": "LIQUID",
    "subCategory": "OIL",
    "unit": "L",
    "price": 86,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": 359687,
    "name": "KARKADAI",
    "category": "DRY ITEMS",
    "subCategory": "OTHER DRY ITEMS",
    "unit": "Kg",
    "price": 17.5,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "a620de",
    "name": "SYRUP RASPBERRY - ( 6 BTL X 0.700 ML )",
    "category": "LIQUID",
    "subCategory": "SYRUPS",
    "unit": "L",
    "price": 195,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "26af38",
    "name": "SYRUP PEACH - ( 6 BTL X 0.700 ML )",
    "category": "LIQUID",
    "subCategory": "SYRUPS",
    "unit": "L",
    "price": 195,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": 740969,
    "name": "SYRUP MANGO JEFARED - ( 6 BTL X 1 LTR )",
    "category": "LIQUID",
    "subCategory": "SYRUPS",
    "unit": "L",
    "price": 295,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "a2d135",
    "name": "SANDWICH PAPER WHITE - ( 20 PKT X 300 SHEET )",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 78,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "89d8e4",
    "name": "RANA VINEGAR WHITE - ( 4 GAL X 3.8L )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "L",
    "price": 44,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": 284991,
    "name": "TUNA INDO - ( 6 CAN X 1.700 KG",
    "category": "MEAT",
    "subCategory": "SEAFOOD",
    "unit": "Kg",
    "price": 185,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "c35ef8",
    "name": "OLIVES SLICE (BLACK) - ( 6 Can X 3KG )",
    "category": "DRY ITEMS",
    "subCategory": "CANNED FOODS",
    "unit": "Kg",
    "price": 110,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "28ab54",
    "name": "BUTTER PAPER SQUARE 40x60 ( 2PKT X 500 )",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 122,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "f1af4b",
    "name": "COOKING CREAM - ( 12 PKT X 1 LTR )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "L",
    "price": 132,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "435c6d",
    "name": "BUTTER - 25 KG ( MARY GOLD )",
    "category": "DAIRY PRODUCTS",
    "subCategory": "DAIRY PRODUCTS",
    "unit": "Kg",
    "price": 190,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "a44dce",
    "name": "MOZZARELLA CHEESE - ( 4 X 2.3 KG )",
    "category": "DAIRY PRODUCTS",
    "subCategory": "CHEESE",
    "unit": "Kg",
    "price": 152,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "4e61f8",
    "name": "SUGAR 50 KG",
    "category": "DRY ITEMS",
    "subCategory": "SUGARS",
    "unit": "Kg",
    "price": 148,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "b05b83",
    "name": "BLACK PEPPER POWDER",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "Kg",
    "price": 15,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "c9e2ed",
    "name": "FLOUR LOCAL - 45 KG",
    "category": "DRY ITEMS",
    "subCategory": "FLOUR",
    "unit": "Kg",
    "price": 32,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "4e4824",
    "name": "GARLIC POWDER - freshly",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "Kg",
    "price": 57,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "c62fa2",
    "name": "Colve",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "Kg",
    "price": 50,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "11587a",
    "name": "Cardomon",
    "category": "DRY ITEMS",
    "subCategory": "OTHER DRY ITEMS",
    "unit": "Kg",
    "price": 107,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "ebe9b6",
    "name": "HUMMS POWDER - 15 KG",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 58,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "06e763",
    "name": "OLIVE OIL 10 LTR",
    "category": "LIQUID",
    "subCategory": "OIL",
    "unit": "L",
    "price": 115,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "9c06df",
    "name": "PAPRIKA POWDER - ( 1kg )",
    "category": "SPICES",
    "subCategory": "SPICES",
    "unit": "kg",
    "price": 31.5,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "cb574c",
    "name": "CHOCOLATE DARK BLOCK / DOBLEN",
    "category": "DRY ITEMS",
    "subCategory": "OTHER DRY ITEMS",
    "unit": "Kg",
    "price": 10.8,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "ce1933",
    "name": "WHITE GLAZE",
    "category": "DRY ITEMS",
    "subCategory": "OTHER DRY ITEMS",
    "unit": "Kg",
    "price": 12,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "d9023b",
    "name": "CRISPY FLACKS",
    "category": "DRY ITEMS",
    "subCategory": "OTHER DRY ITEMS",
    "unit": "Kg",
    "price": 13,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "2c0491",
    "name": "Bakemate Gelatine Powder (700 g )",
    "category": "DRY ITEMS",
    "subCategory": "OTHER DRY ITEMS",
    "unit": "g",
    "price": 66,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "b19f0c",
    "name": "chocolate white block",
    "category": "DRY ITEMS",
    "subCategory": "OTHER DRY ITEMS",
    "unit": "Kg",
    "price": 10.8,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "dccc61",
    "name": "chocolate chips Belgum",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 80,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "5a58b0",
    "name": "bakemate liquid glucose",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "Kg",
    "price": 25,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "109f48",
    "name": "cocoa POWDER -1KG",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 14,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "4a14a2",
    "name": "CAC BRWON SUGER -24 KG",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 255,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "21a77a",
    "name": "cocnut powder",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 12,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "0917a3",
    "name": "‎Afia Corn Oil Tank 17 Liter‎",
    "category": "LIQUID",
    "subCategory": "OIL",
    "unit": "L",
    "price": 115,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "f5263c",
    "name": "MARGREN BEAKERY FRIEND 20KG",
    "category": "DAIRY PRODUCTS",
    "subCategory": "DAIRY PRODUCTS",
    "unit": "Kg",
    "price": 9.75,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "1c973a",
    "name": "MARGREN GOLD CROISSANT excellent",
    "category": "DAIRY PRODUCTS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 11,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "ecfd4b",
    "name": "Coarse semolina",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 4.5,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "5a4bd9",
    "name": "Animal butter formula for croissants - 10 KG",
    "category": "DAIRY PRODUCTS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 425,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "99407c",
    "name": "MARGREN GOLD CROISSANT - 10KG",
    "category": "DAIRY PRODUCTS",
    "subCategory": "DAIRY PRODUCTS",
    "unit": "Kg",
    "price": 115,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "2c0a0c",
    "name": "milk chocolate beans - 10 KG",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 335,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "2c197c",
    "name": "vanilla liquid food king - 28G",
    "category": "LIQUID",
    "subCategory": "SYRUPS",
    "unit": "g",
    "price": 2.5,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "4b330c",
    "name": "Eagle Bread Improver -10 KG",
    "category": "DRY ITEMS",
    "subCategory": "OTHER DRY ITEMS",
    "unit": "Kg",
    "price": 127,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "8b5ac7",
    "name": "EGG - ( 12 TRY X 30 PCS )",
    "category": "DAIRY PRODUCTS",
    "subCategory": "EGGS",
    "unit": "Piece",
    "price": 155,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "4207c0",
    "name": "FULL CREAM MILK POWDER - 25KG",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 195,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "c71620",
    "name": "CHOCALTE STICKS",
    "category": "DRY ITEMS",
    "subCategory": "OTHER DRY ITEMS",
    "unit": "Kg",
    "price": 43,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "f5f567",
    "name": "lemon flavor ( 12 X I L )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "L",
    "price": 54,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "88386f",
    "name": "RED CHILI POWDER",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "Kg",
    "price": 9,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "e27dea",
    "name": "cream caramel bag ( 4 BAG X 3 KG )",
    "category": "DRY ITEMS",
    "subCategory": "OTHER DRY ITEMS",
    "unit": "Kg",
    "price": 110,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "2925fc",
    "name": "KARAK TEA",
    "category": "HOT DRINKS",
    "subCategory": "TEA",
    "unit": "Kg",
    "price": 55,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "f424b6",
    "name": "ketchup bedar ( 4 X 5KG )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "Kg",
    "price": 68,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "b49185",
    "name": "Barbecue sauce FRISHLY - ( 4 X 3.78 KG )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "Kg",
    "price": 252,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "eadaef",
    "name": "WORCESTERSHIRE SAUCE - ( 12 BTL X 295 ML )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "Kg",
    "price": 120,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "ef65cb",
    "name": "TOMATO PASTE - ( 12 BTL - .830 KG )",
    "category": "DRY ITEMS",
    "subCategory": "CANNED FOODS",
    "unit": "Kg",
    "price": 92,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "c28798",
    "name": "YELLOW MUSTARD - ( 4 X 3.63 KG )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "Kg",
    "price": 172,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "1d2954",
    "name": "MAGGI CHICKEN CUBES - ( 24 PKT X 480 G )",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "Kg",
    "price": 335,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "5f34e5",
    "name": "STRAWBERRY JAM - ( 12 JAR X 0.400 G )",
    "category": "DRY ITEMS",
    "subCategory": "CANNED FOODS",
    "unit": "Kg",
    "price": 43,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "a652b2",
    "name": "FRISE BOX - SMALL - 500 PCS",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 40,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "462cd6",
    "name": "ZATAAR",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "Kg",
    "price": 5,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "7f754c",
    "name": "BURGER BOX - large - 500 PCS",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 48,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "488c29",
    "name": "cucumber pickles - 6KG",
    "category": "Default Categories",
    "subCategory": "Uncategorized",
    "unit": "Kg",
    "price": 24,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "c6c35b",
    "name": "Pomegranate molasses baidar (12 X 700 ML )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "mL",
    "price": 141,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "ebf113",
    "name": "Turkish pepper paste (4KG )",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 44,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "e43aab",
    "name": "jelly ( shafaf ) - 5kg",
    "category": "Default Categories",
    "subCategory": "Uncategorized",
    "unit": "Kg",
    "price": 38,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": 790300000000,
    "name": "cutlery set 4 pcs ( 500 PCS )",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 78,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "c8069f",
    "name": "rosemarry - freshly ( 6 x 170 GM )",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "g",
    "price": 115,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "158d85",
    "name": "Pickled Mexican peppers (8 KG )",
    "category": "Default Categories",
    "subCategory": "Uncategorized",
    "unit": "Kg",
    "price": 70,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "9d65a9",
    "name": "Pickled boulev ( 10 KG )",
    "category": "Default Categories",
    "subCategory": "Uncategorized",
    "unit": "Kg",
    "price": 65,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "3b8263",
    "name": "RICE VINEGER (24 x 350 ML )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "mL",
    "price": 130,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "0402a7",
    "name": "Sesame oil ( 12 X 250ML )",
    "category": "LIQUID",
    "subCategory": "OIL",
    "unit": "mL",
    "price": 135,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "2ba767",
    "name": "soya sauce ( 12 x 10 OZ )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "oz",
    "price": 115,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "dd5a1e",
    "name": "corn flour",
    "category": "DRY ITEMS",
    "subCategory": "FLOUR",
    "unit": "Kg",
    "price": 4,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "a39697",
    "name": "Vanilla powder",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "Kg",
    "price": 37,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "e1b3e8",
    "name": "sumac powder",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "Kg",
    "price": 5,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "ea0b82",
    "name": "Coarse salt",
    "category": "DRY ITEMS",
    "subCategory": "SALT",
    "unit": "Kg",
    "price": 1.2,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "a75d39",
    "name": "Crushed red pepper (12 OZ )",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "oz",
    "price": 29,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "22483e",
    "name": "YOGAERT (10 KG )",
    "category": "DAIRY PRODUCTS",
    "subCategory": "MILK",
    "unit": "Kg",
    "price": 47,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "ec85d3",
    "name": "cream ( qishta ) - 5KG",
    "category": "DRY ITEMS",
    "subCategory": "CANNED FOODS",
    "unit": "Kg",
    "price": 60,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "f99503",
    "name": "feta cheese - 16 KG",
    "category": "DAIRY PRODUCTS",
    "subCategory": "CHEESE",
    "unit": "Kg",
    "price": 153,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": 7479000000000,
    "name": "green olives without pits - 6 KG",
    "category": "DRY ITEMS",
    "subCategory": "CANNED FOODS",
    "unit": "Kg",
    "price": 200,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "d1216d",
    "name": "Black olives without pits - 2 X 3.75KG",
    "category": "DRY ITEMS",
    "subCategory": "CANNED FOODS",
    "unit": "Kg",
    "price": 180,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "777d53",
    "name": "SWEET CORN - ( 24 X 340G )",
    "category": "DRY ITEMS",
    "subCategory": "CANNED FOODS",
    "unit": "g",
    "price": 63,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": 959347,
    "name": "RED BEANS ( 24 X 370G )",
    "category": "DRY ITEMS",
    "subCategory": "CANNED FOODS",
    "unit": "g",
    "price": 50,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "dbb881",
    "name": "SHREMP FROZEN 26/30",
    "category": "MEAT",
    "subCategory": "COLD CUTS",
    "unit": "Kg",
    "price": 34,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "cd0ccb",
    "name": "DIJON MUSTERD - ( 12 X 9 OZ )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "oz",
    "price": 160,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "e46a16",
    "name": "CINNAMON POWDER",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 14,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "ce60d9",
    "name": "CHICK PEAS N 7 - 15KG",
    "category": "DRY ITEMS",
    "subCategory": "OTHER DRY ITEMS",
    "unit": "Kg",
    "price": 58,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "e18e5f",
    "name": "QUINOA - 900G",
    "category": "DRY ITEMS",
    "subCategory": "SUGARS",
    "unit": "g",
    "price": 35,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "b2c0a0",
    "name": "GREEN LENTIL - 15KG",
    "category": "DRY ITEMS",
    "subCategory": "GRAINS",
    "unit": "Kg",
    "price": 118,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "4608c3",
    "name": "CASHEW NUT",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "Kg",
    "price": 33,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "a8d635",
    "name": "hazelnut",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 48,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "e9d663",
    "name": "pistachio slice",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 60,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": 31916,
    "name": "Walnut",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "Kg",
    "price": 22,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "54511b",
    "name": "Oat - (12 X 900G )",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "g",
    "price": 125,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "d36157",
    "name": "Almond slices / Pine",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 28,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "61e996",
    "name": "GREEN BEANS - ( 20 X 400G )",
    "category": "DAIRY OTHERS",
    "subCategory": "DAIRY OTHERS",
    "unit": "g",
    "price": 38,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "dae5f1",
    "name": "BALSMIC VINEGAR - ( 12 PCS X 0.5 L )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "L",
    "price": 170,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "4089ba",
    "name": "SWEET CHILLI SAUCE -( 12 X 0.700ML )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "L",
    "price": 115,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "757f2f",
    "name": "APPLE VINEGAR - (6 X 0.750ML )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "L",
    "price": 75,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "b78b45",
    "name": "CHICKEN BREAST (10 kg )",
    "category": "MEAT",
    "subCategory": "POULTRY",
    "unit": "Kg",
    "price": 155,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "a9aeaf",
    "name": "YELLOW LENTIL",
    "category": "DRY ITEMS",
    "subCategory": "GRAINS",
    "unit": "Kg",
    "price": 6,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "06e764",
    "name": "OLIVE OIL 10 LTR ( ALGAMEL )",
    "category": "LIQUID",
    "subCategory": "OIL",
    "unit": "L",
    "price": 278,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "4cf3dd",
    "name": "tea hi 10kg - 10 KG",
    "category": "HOT DRINKS",
    "subCategory": "TEA",
    "unit": "Kg",
    "price": 195,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "STUFF",
    "payment": ""
  },
  {
    "code": "476b21",
    "name": "CHICK PEAS - 15 KG",
    "category": "DRY ITEMS",
    "subCategory": "GRAINS",
    "unit": "Kg",
    "price": 58,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "STUFF",
    "payment": ""
  },
  {
    "code": "eccff4",
    "name": "WHOLE CHICKEN - 10 KG",
    "category": "MEAT",
    "subCategory": "POULTRY",
    "unit": "Kg",
    "price": 122,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "STUFF",
    "payment": ""
  },
  {
    "code": "e808be",
    "name": "LOCAL RICE - 45 KG",
    "category": "DRY ITEMS",
    "subCategory": "GRAINS",
    "unit": "Kg",
    "price": 200,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "STUFF",
    "payment": ""
  },
  {
    "code": "ac9f6e",
    "name": "RED LENTIL - 15 KG",
    "category": "DRY ITEMS",
    "subCategory": "GRAINS",
    "unit": "Kg",
    "price": 80,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "STUFF",
    "payment": ""
  },
  {
    "code": "a7cb93",
    "name": "CURRY POWDER",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "Kg",
    "price": 10,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "STUFF",
    "payment": ""
  },
  {
    "code": "d475a6",
    "name": "TURMERIC POWDER",
    "category": "DRY ITEMS",
    "subCategory": "SPICES",
    "unit": "Kg",
    "price": 9,
    "supplier": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "location": "STUFF",
    "payment": ""
  },
  {
    "code": "50b9a1",
    "name": "corn fried",
    "category": "Default Categories",
    "subCategory": "Uncategorized",
    "unit": "Kg",
    "price": 13.92,
    "supplier": "black raisins for trading",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "2a97a1",
    "name": "smoked salmon fillets - 1KG",
    "category": "MEAT",
    "subCategory": "COLD CUTS",
    "unit": "Kg",
    "price": 88,
    "supplier": "ARABIAN FOOD",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "23572f",
    "name": "MAYONNAISE - ( 4 GAL X 3.780 KG )",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "Kg",
    "price": 180,
    "supplier": "alyasra foods company",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "e47042",
    "name": "SUNDRIED TOMATO ( 4 X 2.290 KG )",
    "category": "DRY ITEMS",
    "subCategory": "CANNED FOODS",
    "unit": "Kg",
    "price": 280,
    "supplier": "AL-ENTISAR TRAGING CO.",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "a0ba3e",
    "name": "YEAST INSTANT - ( 20 PKT X 0.5 KG )",
    "category": "DRY ITEMS",
    "subCategory": "SUGARS",
    "unit": "Kg",
    "price": 130,
    "supplier": "AL-ENTISAR TRAGING CO.",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "be5c80",
    "name": "MAPLE SYRUP",
    "category": "LIQUID",
    "subCategory": "SYRUPS",
    "unit": "L",
    "price": 86,
    "supplier": "AL-ENTISAR TRAGING CO.",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "cd533c",
    "name": "AMERICAN SPECIALTY SLICE - 3KG",
    "category": "DRY ITEMS",
    "subCategory": "CANNED FOODS",
    "unit": "Kg",
    "price": 22,
    "supplier": "AL-ENTISAR TRAGING CO.",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "87440e",
    "name": "THAI SRIACHA HOT CHILI SAUCE - 4.5LTR",
    "category": "LIQUID",
    "subCategory": "SAUCES",
    "unit": "L",
    "price": 70,
    "supplier": "AL-ENTISAR TRAGING CO.",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "a4b7e7",
    "name": "ZANETTI parmesan cheese",
    "category": "DAIRY PRODUCTS",
    "subCategory": "CHEESE",
    "unit": "Kg",
    "price": 45,
    "supplier": "AL-ENTISAR TRAGING CO.",
    "location": "salad",
    "payment": ""
  },
  {
    "code": 6.3e+34,
    "name": "FRENCH EMMENTAL",
    "category": "DAIRY PRODUCTS",
    "subCategory": "CHEESE",
    "unit": "Kg",
    "price": 43,
    "supplier": "AL-ENTISAR TRAGING CO.",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "ea2ef1",
    "name": "CARDINAL RED CHEEDER ENGLAND",
    "category": "DAIRY PRODUCTS",
    "subCategory": "CHEESE",
    "unit": "Kg",
    "price": 31,
    "supplier": "AL-ENTISAR TRAGING CO.",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "2df59c",
    "name": "PRESTIGE BRIE FRANCE - 120G",
    "category": "DAIRY PRODUCTS",
    "subCategory": "CHEESE",
    "unit": "g",
    "price": 16,
    "supplier": "AL-ENTISAR TRAGING CO.",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "21d485",
    "name": "ABU JABAL TEA - ( 6 CAN X 0.750 G )",
    "category": "HOT DRINKS",
    "subCategory": "TEA",
    "unit": "Kg",
    "price": 300,
    "supplier": "AL SWAHIL TRADING CO.",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "45ca0e",
    "name": "CREAM CHEESE - ( 6 BTL X 0.9 G )",
    "category": "DAIRY PRODUCTS",
    "subCategory": "CHEESE",
    "unit": "Kg",
    "price": 72,
    "supplier": "Al Munajem Foods Co",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "ba8a39",
    "name": "AVOCADO",
    "category": "VEGETABLES & FRUITS",
    "subCategory": "VEGETABLES FRESH",
    "unit": "Kg",
    "price": 25.25,
    "supplier": "Al Munajem Foods Co",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "e7274c",
    "name": "LABNEH - ( 4 GAL X 2.75 KG )",
    "category": "DAIRY PRODUCTS",
    "subCategory": "DAIRY OTHERS",
    "unit": "Kg",
    "price": 155,
    "supplier": "Al Munajem Foods Co",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "1025b3",
    "name": "LIVER LAMB (kibda)",
    "category": "MEAT",
    "subCategory": "LAMB",
    "unit": "Kg",
    "price": 13,
    "supplier": "Al Munajem Foods Co",
    "location": "GHABASHI",
    "payment": ""
  },
  {
    "code": "b946b9",
    "name": "HALLOUMI CHEESE - ( 40 PCS X 250 G )",
    "category": "DAIRY PRODUCTS",
    "subCategory": "CHEESE",
    "unit": "Kg",
    "price": 220,
    "supplier": "AL BABTIN FOOD",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": 559292,
    "name": "MULTY INTENSIVE - 25KG",
    "category": "DRY ITEMS",
    "subCategory": "FLOUR",
    "unit": "Kg",
    "price": 420,
    "supplier": "AL BABTIN FOOD",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "5b9413",
    "name": "SOFRA ROLL - 1000 PCS",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "mL",
    "price": 55,
    "supplier": "ABDULAH SALEMIN CO. AL OBTHANI PLASTIC",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "23634a",
    "name": "Naylon bag size 10 ( 15 KG )",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Kg",
    "price": 80,
    "supplier": "ABDULAH SALEMIN CO. AL OBTHANI PLASTIC",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "f725b9",
    "name": "PLASTIC BAG SIZE 2 ( 50 PCS )",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "PKT",
    "price": 10,
    "supplier": "ABDULAH SALEMIN CO. AL OBTHANI PLASTIC",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": 13964,
    "name": "CUP HOLDER PULP TYPE (2) - 250 PC",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 45.22,
    "supplier": "ABDULAH SALEMIN CO. AL OBTHANI PLASTIC",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "7f96bf",
    "name": "SAUCE CUP BLACK - ( 2000 PCS )",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 85,
    "supplier": "ABDULAH SALEMIN CO. AL OBTHANI PLASTIC",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "e55869",
    "name": "Adhesive bags NO 7 (60 pcs )",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 9,
    "supplier": "ABDULAH SALEMIN CO. AL OBTHANI PLASTIC",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": "5a5a58",
    "name": "BLACK BOX 250 pcs ( HOUMS )",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "ctn",
    "price": 65.22,
    "supplier": "ABDULAH SALEMIN CO. AL OBTHANI PLASTIC",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "a31a8e",
    "name": "fork with cover (500pcs )",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 50,
    "supplier": "ABDULAH SALEMIN CO. AL OBTHANI PLASTIC",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "84308f",
    "name": "kraft box pl25 / 1250 pcs",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 100,
    "supplier": "ABDULAH SALEMIN CO. AL OBTHANI PLASTIC",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "a9dc58",
    "name": "Crystal box size 12oz (240 pcs )",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 70,
    "supplier": "ABDULAH SALEMIN CO. AL OBTHANI PLASTIC",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "92f40d",
    "name": "JAR WITH COVER 240 GM -192PCS",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 200,
    "supplier": "ABDULAH SALEMIN CO. AL OBTHANI PLASTIC",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "474df6",
    "name": "Plastic circular box 48 OZ - 240 PCS",
    "category": "MISCELLANEOUS",
    "subCategory": "PACKAGING",
    "unit": "Piece",
    "price": 109,
    "supplier": "ABDULAH SALEMIN CO. AL OBTHANI PLASTIC",
    "location": "salad",
    "payment": ""
  },
  {
    "code": "bfb785",
    "name": "Premium Flour - ALULA - 10 KG",
    "category": "DRY ITEMS",
    "subCategory": "FLOUR",
    "unit": "Kg",
    "price": 14.25,
    "supplier": "موسسه الريم للمواد الغذائيه",
    "location": "bakery",
    "payment": ""
  },
  {
    "code": 387877,
    "name": "GHABASHI PLASTIC BAG - ( 20 PKT X 50 CUP )",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 0,
    "supplier": "",
    "location": "ALL",
    "payment": ""
  },
  {
    "code": "ad20cc",
    "name": "GHABASHI PIE BAG",
    "category": "MISCELLANEOUS",
    "subCategory": "CONSUMABLES",
    "unit": "Piece",
    "price": 0,
    "supplier": "",
    "location": "",
    "payment": ""
  }
]

export const COST_SUPPLIERS: CostSupplier[] = [
  {
    "name": "Company Rukn Al- Muwarridun Comerical-شركة ركن الموردون التجارية",
    "itemCount": 121,
    "categories": [
      "DAIRY PRODUCTS",
      "DRY ITEMS",
      "LIQUID",
      "MISCELLANEOUS",
      "MEAT",
      "DAIRY OTHERS",
      "SPICES",
      "HOT DRINKS",
      "Default Categories"
    ],
    "locations": [
      "ALL",
      "bakery",
      "GHABASHI",
      "salad",
      "STUFF"
    ]
  },
  {
    "name": "Top Fruits",
    "itemCount": 60,
    "categories": [
      "VEGETABLES & FRUITS",
      "SPICES"
    ],
    "locations": [
      "ALL",
      "GHABASHI",
      "salad",
      "STUFF"
    ]
  },
  {
    "name": "Creative Gate",
    "itemCount": 35,
    "categories": [
      "MISCELLANEOUS"
    ],
    "locations": [
      "ALL",
      "GHABASHI",
      "salad"
    ]
  },
  {
    "name": "ABDULAH SALEMIN CO. AL OBTHANI PLASTIC",
    "itemCount": 12,
    "categories": [
      "MISCELLANEOUS"
    ],
    "locations": [
      "ALL",
      "bakery",
      "salad"
    ]
  },
  {
    "name": "AL-ENTISAR TRAGING CO.",
    "itemCount": 9,
    "categories": [
      "DRY ITEMS",
      "LIQUID",
      "DAIRY PRODUCTS"
    ],
    "locations": [
      "ALL",
      "GHABASHI",
      "salad"
    ]
  },
  {
    "name": "رياحين الشام",
    "itemCount": 6,
    "categories": [
      "DRY ITEMS",
      "DAIRY PRODUCTS"
    ],
    "locations": [
      "salad"
    ]
  },
  {
    "name": "Emtyaz wholesale company",
    "itemCount": 6,
    "categories": [
      "LIQUID",
      "Default Categories",
      "DRY ITEMS"
    ],
    "locations": [
      "ALL",
      "salad"
    ]
  },
  {
    "name": "National Food Company-Americana",
    "itemCount": 5,
    "categories": [
      "MEAT",
      "DRY ITEMS"
    ],
    "locations": [
      "ALL",
      "GHABASHI"
    ]
  },
  {
    "name": "MAMSA TRADING",
    "itemCount": 5,
    "categories": [
      "MISCELLANEOUS",
      "DRY ITEMS"
    ],
    "locations": [
      "ALL"
    ]
  },
  {
    "name": "Forsan Foods & Consumer Products Co Ltd",
    "itemCount": 5,
    "categories": [
      "DAIRY PRODUCTS",
      "MEAT"
    ],
    "locations": [
      "ALL",
      "GHABASHI"
    ]
  },
  {
    "name": "Al Munajem Foods Co",
    "itemCount": 4,
    "categories": [
      "DAIRY PRODUCTS",
      "VEGETABLES & FRUITS",
      "MEAT"
    ],
    "locations": [
      "ALL",
      "GHABASHI"
    ]
  },
  {
    "name": "TILAL GHAWAR FOR TRADING",
    "itemCount": 3,
    "categories": [
      "DAIRY OTHERS"
    ],
    "locations": [
      "GHABASHI"
    ]
  },
  {
    "name": "The Coca Cola Bottling Company",
    "itemCount": 3,
    "categories": [
      "SOFT DRINKS"
    ],
    "locations": [
      "GHABASHI"
    ]
  },
  {
    "name": "TALAL ONE TRADING COMPANY",
    "itemCount": 2,
    "categories": [
      "MEAT",
      "DRY ITEMS"
    ],
    "locations": [
      "salad"
    ]
  },
  {
    "name": "Sitaf company for trade",
    "itemCount": 2,
    "categories": [
      "LIQUID"
    ],
    "locations": [
      "ALL"
    ]
  },
  {
    "name": "SAAD FOR TRADING",
    "itemCount": 2,
    "categories": [
      "DRY ITEMS"
    ],
    "locations": [
      "ALL",
      "bakery"
    ]
  },
  {
    "name": "moltaqa alkhabbazeen",
    "itemCount": 2,
    "categories": [
      "DRY ITEMS"
    ],
    "locations": [
      "bakery"
    ]
  },
  {
    "name": "AL BABTIN FOOD",
    "itemCount": 2,
    "categories": [
      "DAIRY PRODUCTS",
      "DRY ITEMS"
    ],
    "locations": [
      "ALL",
      "bakery"
    ]
  },
  {
    "name": "",
    "itemCount": 2,
    "categories": [
      "MISCELLANEOUS"
    ],
    "locations": [
      "ALL"
    ]
  },
  {
    "name": "موسسه عذوب للمياه والمرطبات",
    "itemCount": 1,
    "categories": [
      "SOFT DRINKS"
    ],
    "locations": [
      "GHABASHI"
    ]
  },
  {
    "name": "موسسه راغب مصطفي الشنواني للتجاره",
    "itemCount": 1,
    "categories": [
      "DAIRY PRODUCTS"
    ],
    "locations": [
      "salad"
    ]
  },
  {
    "name": "شركه محمود نشار وشركائه",
    "itemCount": 1,
    "categories": [
      "DRY ITEMS"
    ],
    "locations": [
      "GHABASHI"
    ]
  },
  {
    "name": "شركه تمور الاحمدية",
    "itemCount": 1,
    "categories": [
      "DAIRY OTHERS"
    ],
    "locations": [
      "salad"
    ]
  },
  {
    "name": "شركة مصنع الفا العالميه للصناعات الغذائيه",
    "itemCount": 1,
    "categories": [
      "DAIRY PRODUCTS"
    ],
    "locations": [
      "ALL"
    ]
  },
  {
    "name": "شركة سهم المصدر للتجاره",
    "itemCount": 1,
    "categories": [
      "MISCELLANEOUS"
    ],
    "locations": [
      "salad"
    ]
  },
  {
    "name": "Wijhat Al Ghethaشركة واجهة الغذاء",
    "itemCount": 1,
    "categories": [
      "MEAT"
    ],
    "locations": [
      "GHABASHI"
    ]
  },
  {
    "name": "WIJHAT AJGETHA",
    "itemCount": 1,
    "categories": [
      "MEAT"
    ],
    "locations": [
      "GHABASHI"
    ]
  },
  {
    "name": "TASTE DEVELOPMENT",
    "itemCount": 1,
    "categories": [
      "DAIRY PRODUCTS"
    ],
    "locations": [
      "GHABASHI"
    ]
  },
  {
    "name": "STAR TIME PLASTIC",
    "itemCount": 1,
    "categories": [
      "MISCELLANEOUS"
    ],
    "locations": [
      "ALL"
    ]
  },
  {
    "name": "SAS ALKHER TRDING",
    "itemCount": 1,
    "categories": [
      "Default Categories"
    ],
    "locations": [
      "bakery"
    ]
  },
  {
    "name": "SADIA",
    "itemCount": 1,
    "categories": [
      "Default Categories"
    ],
    "locations": [
      "GHABASHI"
    ]
  },
  {
    "name": "ORGANIZING IDEAS TRADING CO",
    "itemCount": 1,
    "categories": [
      "LIQUID"
    ],
    "locations": [
      "ALL"
    ]
  },
  {
    "name": "NODA TRADING CO",
    "itemCount": 1,
    "categories": [
      "DRY ITEMS"
    ],
    "locations": [
      "salad"
    ]
  },
  {
    "name": "nakhal barari trading co.",
    "itemCount": 1,
    "categories": [
      "SOFT DRINKS"
    ],
    "locations": [
      "salad"
    ]
  },
  {
    "name": "local purchase- متجر راكات",
    "itemCount": 1,
    "categories": [
      "DRY ITEMS"
    ],
    "locations": [
      "salad"
    ]
  },
  {
    "name": "local purchase",
    "itemCount": 1,
    "categories": [
      "DRY ITEMS"
    ],
    "locations": [
      "bakery"
    ]
  },
  {
    "name": "local market",
    "itemCount": 1,
    "categories": [
      "LIQUID"
    ],
    "locations": [
      "salad"
    ]
  },
  {
    "name": "HAMASA KHAYAL TRADING",
    "itemCount": 1,
    "categories": [
      "MISCELLANEOUS"
    ],
    "locations": [
      "ALL"
    ]
  },
  {
    "name": "food choice trading co",
    "itemCount": 1,
    "categories": [
      "DRY ITEMS"
    ],
    "locations": [
      "salad"
    ]
  },
  {
    "name": "black raisins for trading",
    "itemCount": 1,
    "categories": [
      "Default Categories"
    ],
    "locations": [
      "salad"
    ]
  },
  {
    "name": "ARABIAN FOOD",
    "itemCount": 1,
    "categories": [
      "MEAT"
    ],
    "locations": [
      "salad"
    ]
  },
  {
    "name": "alyasra foods company",
    "itemCount": 1,
    "categories": [
      "LIQUID"
    ],
    "locations": [
      "GHABASHI"
    ]
  },
  {
    "name": "AL SWAHIL TRADING CO.",
    "itemCount": 1,
    "categories": [
      "HOT DRINKS"
    ],
    "locations": [
      "GHABASHI"
    ]
  },
  {
    "name": "موسسه الريم للمواد الغذائيه",
    "itemCount": 1,
    "categories": [
      "DRY ITEMS"
    ],
    "locations": [
      "bakery"
    ]
  }
]

export const WASTAGE: { vegetables: WastageItem[]; proteins: WastageItem[] } = {
  "vegetables": [
    {
      "name": "Lettuce",
      "unit": "kg",
      "qty": 1000,
      "waste": 492,
      "wastePct": 0.492,
      "pricePerKg": 4.75,
      "finalPrice": 7.087
    },
    {
      "name": "Rocca",
      "unit": "kg",
      "qty": 1000,
      "waste": 240,
      "wastePct": 0.24,
      "pricePerKg": 2.4,
      "finalPrice": 2.976
    },
    {
      "name": "Parsley",
      "unit": "kg",
      "qty": 1000,
      "waste": 100,
      "wastePct": 0.1,
      "pricePerKg": 2.4,
      "finalPrice": 2.64
    },
    {
      "name": "Coriander",
      "unit": "kg",
      "qty": 1000,
      "waste": 0,
      "wastePct": 0.1,
      "pricePerKg": 2.4,
      "finalPrice": 2.64
    },
    {
      "name": "Mint",
      "unit": "kg",
      "qty": 1000,
      "waste": 0,
      "wastePct": 0.1,
      "pricePerKg": 2.4,
      "finalPrice": 2.64
    },
    {
      "name": "Red Papper",
      "unit": "kg",
      "qty": 1000,
      "waste": 80,
      "wastePct": 0.08,
      "pricePerKg": 11,
      "finalPrice": 11.88
    },
    {
      "name": "Tomato",
      "unit": "kg",
      "qty": 1000,
      "waste": 44,
      "wastePct": 0.044,
      "pricePerKg": 4.5,
      "finalPrice": 4.698
    },
    {
      "name": "Yellow Onion",
      "unit": "kg",
      "qty": 1000,
      "waste": 75,
      "wastePct": 0.075,
      "pricePerKg": 3.5,
      "finalPrice": 3.7625
    },
    {
      "name": "Garlic",
      "unit": "kg",
      "qty": 1000,
      "waste": 75,
      "wastePct": 0.075,
      "pricePerKg": 6,
      "finalPrice": 6.45
    },
    {
      "name": "Mushroom",
      "unit": "kg",
      "qty": 1000,
      "waste": 0,
      "wastePct": 0,
      "pricePerKg": 34,
      "finalPrice": 34
    },
    {
      "name": "Spinach (Blend)",
      "unit": "kg",
      "qty": 1000,
      "waste": 0,
      "wastePct": 0.1,
      "pricePerKg": 2.4,
      "finalPrice": 2.64
    },
    {
      "name": "Orange",
      "unit": "kg",
      "qty": 1000,
      "waste": 680,
      "wastePct": 0.68,
      "pricePerKg": 4,
      "finalPrice": 6.72
    },
    {
      "name": "Lime",
      "unit": "kg",
      "qty": 1000,
      "waste": 720,
      "wastePct": 0.72,
      "pricePerKg": 6.75,
      "finalPrice": 11.61
    },
    {
      "name": "Lemon",
      "unit": "kg",
      "qty": 1000,
      "waste": 540,
      "wastePct": 0.54,
      "pricePerKg": 5.95,
      "finalPrice": 9.163
    }
  ],
  "proteins": [
    {
      "name": "Salmon",
      "unit": "kg",
      "qty": 2200,
      "waste": 840,
      "wastePct": 0.3818181818,
      "pricePerKg": 94,
      "finalPrice": 129.8909091
    },
    {
      "name": "Chicken",
      "unit": "kg",
      "qty": 1000,
      "waste": 100,
      "wastePct": 0.1,
      "pricePerKg": 16,
      "finalPrice": 17.6
    },
    {
      "name": "Frozen salmon",
      "unit": "kg",
      "qty": 1000,
      "waste": 185,
      "wastePct": 0.185,
      "pricePerKg": 66,
      "finalPrice": 78.21
    }
  ]
}

export interface RecipeIngredient {
  name: string; unit: string; qty: number; totalCost: number
}
export interface Recipe {
  name: string; menuGroup: string; sellingPrice: number
  totalCost: number; foodCostPct: number; ingredients: RecipeIngredient[]
}

export const RECIPES: Recipe[] = [
  {
    "name": "Truffle Phillycheese steak",
    "menuGroup": "Sandwhiches",
    "sellingPrice": 12.17,
    "totalCost": 0,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      },
      {
        "name": "Butter",
        "unit": "gm",
        "qty": 1,
        "totalCost": 0.0076
      },
      {
        "name": "Onion",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.0376
      },
      {
        "name": "Mushroom",
        "unit": "gm",
        "qty": 6,
        "totalCost": 0.204
      },
      {
        "name": "Steak",
        "unit": "gm",
        "qty": 80,
        "totalCost": 2.72
      },
      {
        "name": "Yellow Cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.5734736842
      },
      {
        "name": "Truffle Sauce",
        "unit": "gm",
        "qty": 16,
        "totalCost": 0.6916611884
      },
      {
        "name": "Magi Water",
        "unit": "gm",
        "qty": 30,
        "totalCost": 0.001
      },
      {
        "name": "Cooking Oil",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.02529411765
      },
      {
        "name": "Spices",
        "unit": "gm",
        "qty": 1,
        "totalCost": 0.01626388889
      }
    ]
  },
  {
    "name": "Chicken Sandwhich",
    "menuGroup": "Sandwhiches",
    "sellingPrice": 11.3,
    "totalCost": 2.2063,
    "foodCostPct": 19.5,
    "ingredients": [
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      },
      {
        "name": "Chicken",
        "unit": "gm",
        "qty": 55,
        "totalCost": 1.463
      },
      {
        "name": "Maple Sauce",
        "unit": "gm",
        "qty": 19,
        "totalCost": 0.2790243902
      },
      {
        "name": "White Cheese Slice",
        "unit": "gm",
        "qty": 13,
        "totalCost": 0.2720264317
      },
      {
        "name": "Lettuce",
        "unit": "gm",
        "qty": 11,
        "totalCost": 0.07799
      }
    ]
  },
  {
    "name": "Spicy Chicken Sandwhich",
    "menuGroup": "Sandwhiches",
    "sellingPrice": 12.17,
    "totalCost": 2.2063,
    "foodCostPct": 18.1,
    "ingredients": [
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      },
      {
        "name": "Chicken",
        "unit": "gm",
        "qty": 55,
        "totalCost": 1.463
      },
      {
        "name": "Maple Sauce",
        "unit": "gm",
        "qty": 19,
        "totalCost": 0.2790243902
      },
      {
        "name": "White Cheese Slice",
        "unit": "gm",
        "qty": 13,
        "totalCost": 0.2720264317
      },
      {
        "name": "Lettuce",
        "unit": "gm",
        "qty": 11,
        "totalCost": 0.07799
      }
    ]
  },
  {
    "name": "Shakshouka",
    "menuGroup": "Egg",
    "sellingPrice": 6.09,
    "totalCost": 0.9674,
    "foodCostPct": 15.9,
    "ingredients": [
      {
        "name": "onion",
        "unit": "gm",
        "qty": 2,
        "totalCost": 0.00752
      },
      {
        "name": "Tomato sliced",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.0564
      },
      {
        "name": "Tomato Paste 1 sp",
        "unit": "gm",
        "qty": 13,
        "totalCost": 0.1200803213
      },
      {
        "name": "Egg Mixture",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.6438628159
      },
      {
        "name": "Cooking Oil",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.02529411765
      },
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      }
    ]
  },
  {
    "name": "Egg Avocado",
    "menuGroup": "Egg",
    "sellingPrice": 8.7,
    "totalCost": 2.1708,
    "foodCostPct": 25,
    "ingredients": [
      {
        "name": "Egg mixture",
        "unit": "gm",
        "qty": 80,
        "totalCost": 0.8584837545
      },
      {
        "name": "Mozarella Cheese",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.1652173913
      },
      {
        "name": "Yellow Cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.1982608696
      },
      {
        "name": "Egg Sauce",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.119702586
      },
      {
        "name": "Avocado Paste",
        "unit": "gm",
        "qty": 28,
        "totalCost": 0.6895602294
      },
      {
        "name": "Cooking Oil",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.02529411765
      },
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      }
    ]
  },
  {
    "name": "Egg With Truffle Sandwhich",
    "menuGroup": "Egg",
    "sellingPrice": 8.7,
    "totalCost": 1.7074,
    "foodCostPct": 19.6,
    "ingredients": [
      {
        "name": "Egg mixture",
        "unit": "gm",
        "qty": 80,
        "totalCost": 0.8584837545
      },
      {
        "name": "Mozarella Cheese",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.1652173913
      },
      {
        "name": "Yellow Cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.1982608696
      },
      {
        "name": "Truffle Sauce",
        "unit": "gm",
        "qty": 8,
        "totalCost": 0.3458305942
      },
      {
        "name": "Cooking Oil",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.02529411765
      },
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      }
    ]
  },
  {
    "name": "Egg Turkey Avocado CIabatta",
    "menuGroup": "Ciabatta",
    "sellingPrice": 13.04,
    "totalCost": 3.0163,
    "foodCostPct": 23.1,
    "ingredients": [
      {
        "name": "White Chibatta",
        "unit": "gm",
        "qty": 72,
        "totalCost": 0.1006640350877193
      },
      {
        "name": "Turkey",
        "unit": "gm",
        "qty": 31,
        "totalCost": 0.775
      },
      {
        "name": "Avocado Paste",
        "unit": "gm",
        "qty": 33,
        "totalCost": 0.8126959847
      },
      {
        "name": "Egg Sauce",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.119702586
      },
      {
        "name": "Rocca",
        "unit": "gm",
        "qty": 4,
        "totalCost": 0.01192
      },
      {
        "name": "Egg mixture with mozarella",
        "unit": "gm",
        "qty": 80,
        "totalCost": 0.8584837545
      },
      {
        "name": "Yellow Cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.1982608696
      },
      {
        "name": "Cooking Oil",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.02529411765
      },
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      }
    ]
  },
  {
    "name": "Chicken Burger",
    "menuGroup": "Burger",
    "sellingPrice": 0,
    "totalCost": 5.1675,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Chicken",
        "unit": "gm",
        "qty": 157,
        "totalCost": 4.3489
      },
      {
        "name": "Maple Sauce",
        "unit": "gm",
        "qty": 27,
        "totalCost": 0.396508344
      },
      {
        "name": "White Cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.2511013216
      },
      {
        "name": "Lettuce",
        "unit": "gm",
        "qty": 8,
        "totalCost": 0.05672
      },
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      }
    ]
  },
  {
    "name": "Truffle Double Cheese Burger",
    "menuGroup": "Burger",
    "sellingPrice": 14.78,
    "totalCost": 5.6715,
    "foodCostPct": 38.4,
    "ingredients": [
      {
        "name": "Butter",
        "unit": "gm",
        "qty": 2,
        "totalCost": 0.0152
      },
      {
        "name": "Onion",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.0376
      },
      {
        "name": "Meat",
        "unit": "gm",
        "qty": 140,
        "totalCost": 2.919
      },
      {
        "name": "Yellow Cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.2511013216
      },
      {
        "name": "Truffle Sauce",
        "unit": "gm",
        "qty": 54,
        "totalCost": 2.334356511
      },
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      }
    ]
  },
  {
    "name": "Single Cheese Burger",
    "menuGroup": "Burger",
    "sellingPrice": 11.3,
    "totalCost": 2.2159,
    "foodCostPct": 19.6,
    "ingredients": [
      {
        "name": "Butter",
        "unit": "gm",
        "qty": 2,
        "totalCost": 0.0152
      },
      {
        "name": "Onion",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.0376
      },
      {
        "name": "Meat",
        "unit": "gm",
        "qty": 70,
        "totalCost": 1.4595
      },
      {
        "name": "Yellow Cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.2511013216
      },
      {
        "name": "Burger Sauce",
        "unit": "gm",
        "qty": 54,
        "totalCost": 0.4524660691
      }
    ]
  },
  {
    "name": "Double Cheese Burger",
    "menuGroup": "Burger",
    "sellingPrice": 13.91,
    "totalCost": 3.6754,
    "foodCostPct": 26.4,
    "ingredients": [
      {
        "name": "Butter",
        "unit": "gm",
        "qty": 2,
        "totalCost": 0.0152
      },
      {
        "name": "Onion",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.0376
      },
      {
        "name": "Meat",
        "unit": "gm",
        "qty": 140,
        "totalCost": 2.919
      },
      {
        "name": "Yellow Cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.2511013216
      },
      {
        "name": "Burger Sauce",
        "unit": "gm",
        "qty": 54,
        "totalCost": 0.4524660691
      }
    ]
  },
  {
    "name": "Liver Sandwhich",
    "menuGroup": "Kebda",
    "sellingPrice": 6.09,
    "totalCost": 1.7026,
    "foodCostPct": 28,
    "ingredients": [
      {
        "name": "Onion",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.0376
      },
      {
        "name": "Oil",
        "unit": "gm",
        "qty": 20,
        "totalCost": 0.23
      },
      {
        "name": "Vinegar",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.01447368421
      },
      {
        "name": "Salt",
        "unit": "gm",
        "qty": 1,
        "totalCost": 0.003555555556
      },
      {
        "name": "Tomato Paste",
        "unit": "gm",
        "qty": 14,
        "totalCost": 0.1293172691
      },
      {
        "name": "Tomato",
        "unit": "gm",
        "qty": 23,
        "totalCost": 0.1081
      },
      {
        "name": "Cooking Oil",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.02529411765
      },
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      },
      {
        "name": "Kebda",
        "unit": "gm",
        "qty": 80,
        "totalCost": 1.04
      }
    ]
  },
  {
    "name": "Liver Pie",
    "menuGroup": "Kebda",
    "sellingPrice": 7.83,
    "totalCost": 1.6577,
    "foodCostPct": 21.2,
    "ingredients": [
      {
        "name": "Oil",
        "unit": "gm",
        "qty": 15,
        "totalCost": 0.1725
      },
      {
        "name": "Onion",
        "unit": "gm",
        "qty": 18,
        "totalCost": 0.06768
      },
      {
        "name": "Garlic",
        "unit": "gm",
        "qty": 1,
        "totalCost": 0.00665
      },
      {
        "name": "Kebda",
        "unit": "gm",
        "qty": 80,
        "totalCost": 1.04
      },
      {
        "name": "Vinegar",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.01447368421
      },
      {
        "name": "Tomato",
        "unit": "gm",
        "qty": 24,
        "totalCost": 0.1128
      },
      {
        "name": "Tomato paste",
        "unit": "gm",
        "qty": 14,
        "totalCost": 0.1293172691
      },
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      }
    ]
  },
  {
    "name": "Chicken Strips",
    "menuGroup": "Side Orders",
    "sellingPrice": 12.17,
    "totalCost": 3.6225,
    "foodCostPct": 29.8,
    "ingredients": [
      {
        "name": "Chicken 3pcs",
        "unit": "gm",
        "qty": 135,
        "totalCost": 3.591
      },
      {
        "name": "Paprika",
        "unit": "gm",
        "qty": 1,
        "totalCost": 0.0315
      }
    ]
  },
  {
    "name": "Chicken Strips Spicy",
    "menuGroup": "Side Orders",
    "sellingPrice": 12.17,
    "totalCost": 3.6225,
    "foodCostPct": 29.8,
    "ingredients": [
      {
        "name": "Chicken 3pcs",
        "unit": "gm",
        "qty": 135,
        "totalCost": 3.591
      },
      {
        "name": "Paprika",
        "unit": "gm",
        "qty": 1,
        "totalCost": 0.0315
      }
    ]
  },
  {
    "name": "Fries",
    "menuGroup": "Side Order",
    "sellingPrice": 6.09,
    "totalCost": 0.9855,
    "foodCostPct": 16.2,
    "ingredients": [
      {
        "name": "Fries",
        "unit": "gm",
        "qty": 180,
        "totalCost": 0.954
      },
      {
        "name": "Paprika",
        "unit": "gm",
        "qty": 1,
        "totalCost": 0.0315
      }
    ]
  },
  {
    "name": "Truffle Sauce",
    "menuGroup": "Side Orders",
    "sellingPrice": 3.48,
    "totalCost": 0,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Truffle Sauce",
        "unit": "gm",
        "qty": 30,
        "totalCost": 1.296864728
      }
    ]
  },
  {
    "name": "Maple Sauce",
    "menuGroup": "Side Orders",
    "sellingPrice": 2.61,
    "totalCost": 0.4406,
    "foodCostPct": 16.9,
    "ingredients": [
      {
        "name": "Maple Sauce",
        "unit": "gm",
        "qty": 30,
        "totalCost": 0.4405648267
      }
    ]
  },
  {
    "name": "Ghabashi Sauce",
    "menuGroup": "Side Orders",
    "sellingPrice": 2.61,
    "totalCost": 0,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Ghabashi Sauce",
        "unit": "gm",
        "qty": 30,
        "totalCost": 0.3884117965
      }
    ]
  },
  {
    "name": "Pink Lemonade",
    "menuGroup": "Drinks",
    "sellingPrice": 7.83,
    "totalCost": 0,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Lemon",
        "unit": "gm",
        "qty": 700,
        "totalCost": 6.419
      },
      {
        "name": "Mint",
        "unit": "gm",
        "qty": 35,
        "totalCost": 0.0924
      },
      {
        "name": "Sugars",
        "unit": "gm",
        "qty": 550,
        "totalCost": 1.628
      },
      {
        "name": "Water",
        "unit": "lt",
        "qty": 3600,
        "totalCost": 0
      },
      {
        "name": "Lime",
        "unit": "gm",
        "qty": 300,
        "totalCost": 3.483
      },
      {
        "name": "Beetroot",
        "unit": "gm",
        "qty": 100,
        "totalCost": 0.45
      }
    ]
  },
  {
    "name": "Karkade",
    "menuGroup": "Drinks",
    "sellingPrice": 7.83,
    "totalCost": 27.8735,
    "foodCostPct": 356,
    "ingredients": [
      {
        "name": "Water",
        "unit": "lt",
        "qty": 6,
        "totalCost": 0
      },
      {
        "name": "Karkade",
        "unit": "gm",
        "qty": 200,
        "totalCost": 3.5
      },
      {
        "name": "Sugar",
        "unit": "gm",
        "qty": 500,
        "totalCost": 1.48
      },
      {
        "name": "Habaq",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.006
      },
      {
        "name": "Mango Syrup",
        "unit": "gm",
        "qty": 135,
        "totalCost": 6.6375
      },
      {
        "name": "Raseberry Syrup",
        "unit": "gm",
        "qty": 350,
        "totalCost": 16.25
      }
    ]
  },
  {
    "name": "Peanut Butter",
    "menuGroup": "Pie",
    "sellingPrice": 6.96,
    "totalCost": 0.7318,
    "foodCostPct": 10.5,
    "ingredients": [
      {
        "name": "Peanut Butter",
        "unit": "gm",
        "qty": 65,
        "totalCost": 0.6175
      },
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      }
    ]
  },
  {
    "name": "Creamy Cheese",
    "menuGroup": "Pie",
    "sellingPrice": 4.35,
    "totalCost": 0.7809,
    "foodCostPct": 18,
    "ingredients": [
      {
        "name": "Creamy Cheese",
        "unit": "gm",
        "qty": 50,
        "totalCost": 0.6666666667
      },
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      }
    ]
  },
  {
    "name": "Mix Fries",
    "menuGroup": "Fries",
    "sellingPrice": 9.57,
    "totalCost": 1.4107,
    "foodCostPct": 14.7,
    "ingredients": [
      {
        "name": "Fries",
        "unit": "gm",
        "qty": 190,
        "totalCost": 1.007
      },
      {
        "name": "Ghabashi Sauce",
        "unit": "gm",
        "qty": 30,
        "totalCost": 0.3884117965
      },
      {
        "name": "Onion Fried",
        "unit": "gm",
        "qty": 15,
        "totalCost": 0.00376
      },
      {
        "name": "Mix Spices",
        "unit": "gm",
        "qty": 0.01,
        "totalCost": 0.01157333333
      }
    ]
  },
  {
    "name": "Mix Fries With Beef",
    "menuGroup": "Fries",
    "sellingPrice": 15.65,
    "totalCost": 1.6234,
    "foodCostPct": 10.4,
    "ingredients": [
      {
        "name": "Fries",
        "unit": "gm",
        "qty": 190,
        "totalCost": 1.007
      },
      {
        "name": "Ghabashi Sauce",
        "unit": "gm",
        "qty": 30,
        "totalCost": 0.3884117965
      },
      {
        "name": "Onion Fried",
        "unit": "gm",
        "qty": 15,
        "totalCost": 0.0564
      },
      {
        "name": "Mix Spice",
        "unit": "gm",
        "qty": 0.01,
        "totalCost": 0.01157333333
      },
      {
        "name": "Meat Mix Burger",
        "unit": "gm",
        "qty": 45,
        "totalCost": 0.16
      }
    ]
  },
  {
    "name": "Fries With Chicken",
    "menuGroup": "Fries",
    "sellingPrice": 15.65,
    "totalCost": 3.8061,
    "foodCostPct": 24.3,
    "ingredients": [
      {
        "name": "Fries",
        "unit": "gm",
        "qty": 190,
        "totalCost": 1.007
      },
      {
        "name": "Ghabashi Sauce",
        "unit": "gm",
        "qty": 30,
        "totalCost": 0.3884117965
      },
      {
        "name": "Onion Fried",
        "unit": "gm",
        "qty": 15,
        "totalCost": 0.0564
      },
      {
        "name": "Mix Spices",
        "unit": "gm",
        "qty": 1,
        "totalCost": 1.157333333
      },
      {
        "name": "Chicken Strips",
        "unit": "gm",
        "qty": 45,
        "totalCost": 1.197
      }
    ]
  },
  {
    "name": "Brownie",
    "menuGroup": "Extras",
    "sellingPrice": 6.96,
    "totalCost": 23.9925,
    "foodCostPct": 344.7,
    "ingredients": [
      {
        "name": "Dark choco chip",
        "unit": "Gm",
        "qty": 600,
        "totalCost": 6.48
      },
      {
        "name": "Butter",
        "unit": "Gm",
        "qty": 510,
        "totalCost": 3.876
      },
      {
        "name": "Sugar",
        "unit": "Gm",
        "qty": 600,
        "totalCost": 1.776
      },
      {
        "name": "Brown sugar",
        "unit": "Gm",
        "qty": 280,
        "totalCost": 2.975
      },
      {
        "name": "Egg",
        "unit": "Gm",
        "qty": 600,
        "totalCost": 7.456140351
      },
      {
        "name": "Flour",
        "unit": "Gm",
        "qty": 360,
        "totalCost": 0.256
      },
      {
        "name": "Cocoa powder",
        "unit": "Gm",
        "qty": 80,
        "totalCost": 1.12
      },
      {
        "name": "Salt",
        "unit": "Gm",
        "qty": 15,
        "totalCost": 0.05333333333
      }
    ]
  },
  {
    "name": "Phillycheese steak",
    "menuGroup": "Sandwhiches",
    "sellingPrice": 11.3,
    "totalCost": 3.6667,
    "foodCostPct": 32.4,
    "ingredients": [
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      },
      {
        "name": "Butter",
        "unit": "gm",
        "qty": 1,
        "totalCost": 0.0076
      },
      {
        "name": "Onion",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.0376
      },
      {
        "name": "Mushroom",
        "unit": "gm",
        "qty": 6,
        "totalCost": 0.204
      },
      {
        "name": "Steak",
        "unit": "gm",
        "qty": 80,
        "totalCost": 2.48
      },
      {
        "name": "Yellow Cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.57348
      },
      {
        "name": "Ghabashi Sauce",
        "unit": "gm",
        "qty": 16,
        "totalCost": 0.2071529582
      },
      {
        "name": "Magi Water",
        "unit": "gm",
        "qty": 30,
        "totalCost": 0.001
      },
      {
        "name": "Cooking Oil",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.02529411765
      },
      {
        "name": "Spices",
        "unit": "gm",
        "qty": 1,
        "totalCost": 0.01626388888888889
      }
    ]
  },
  {
    "name": "Truffle Chicken Sandwhich",
    "menuGroup": "Sandwhiches",
    "sellingPrice": 12.17,
    "totalCost": 2.619,
    "foodCostPct": 21.5,
    "ingredients": [
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      },
      {
        "name": "Chicken",
        "unit": "gm",
        "qty": 55,
        "totalCost": 1.463
      },
      {
        "name": "Truffle Sauce",
        "unit": "gm",
        "qty": 16,
        "totalCost": 0.6916611883691531
      },
      {
        "name": "White Cheese Slice",
        "unit": "gm",
        "qty": 13,
        "totalCost": 0.2720264317
      },
      {
        "name": "Lettuce",
        "unit": "gm",
        "qty": 11,
        "totalCost": 0.07799
      }
    ]
  },
  {
    "name": "Plain Egg",
    "menuGroup": "Egg",
    "sellingPrice": 5.22,
    "totalCost": 0,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Egg mixture",
        "unit": "gm",
        "qty": 80,
        "totalCost": 0.8584837545
      },
      {
        "name": "Mozarella Cheese",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.1652173913
      },
      {
        "name": "Cooking Oil",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.02529411765
      },
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      }
    ]
  },
  {
    "name": "Chessy Egg Sandwhich",
    "menuGroup": "Egg",
    "sellingPrice": 6.09,
    "totalCost": 0,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Egg mixture",
        "unit": "gm",
        "qty": 80,
        "totalCost": 0.8584837545
      },
      {
        "name": "Mozarella Cheese",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.1652173913
      },
      {
        "name": "Yellow Cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.57348
      },
      {
        "name": "White Cheese سايل",
        "unit": "gm",
        "qty": 6,
        "totalCost": 0.08
      },
      {
        "name": "Cooking Oil",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.02529411765
      },
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      }
    ]
  },
  {
    "name": "Chessy Egg with Turkey",
    "menuGroup": "Egg",
    "sellingPrice": 7.83,
    "totalCost": 0,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Egg mixture",
        "unit": "gm",
        "qty": 80,
        "totalCost": 0.8584837545
      },
      {
        "name": "Mozarella Cheese",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.1652173913
      },
      {
        "name": "Yellow Cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.57348
      },
      {
        "name": "Egg Sauce",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.119702586
      },
      {
        "name": "Avocado Paste",
        "unit": "gm",
        "qty": 28,
        "totalCost": 0.6895602294
      },
      {
        "name": "Turkey",
        "unit": "gm",
        "qty": 14,
        "totalCost": 0.35
      },
      {
        "name": "Cooking Oil",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.02529411765
      },
      {
        "name": "Bread",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.1142833227344992
      }
    ]
  },
  {
    "name": "Egg Halloumi Ciabatta",
    "menuGroup": "Ciabatta",
    "sellingPrice": 13.04,
    "totalCost": 3.4482,
    "foodCostPct": 26.4,
    "ingredients": [
      {
        "name": "White Chibatta",
        "unit": "gm",
        "qty": 55,
        "totalCost": 0.1006640350877193
      },
      {
        "name": "Halloumi",
        "unit": "gm",
        "qty": 41,
        "totalCost": 0.902
      },
      {
        "name": "Avocado Paste",
        "unit": "gm",
        "qty": 33,
        "totalCost": 0.8126959847
      },
      {
        "name": "Egg Sauce",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.119702586
      },
      {
        "name": "Dried Tomato",
        "unit": "gm",
        "qty": 2,
        "totalCost": 0.044
      },
      {
        "name": "Rocca",
        "unit": "gm",
        "qty": 4,
        "totalCost": 0.01192
      },
      {
        "name": "Egg mixture",
        "unit": "gm",
        "qty": 80,
        "totalCost": 0.8584837545
      },
      {
        "name": "Yellow Cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.57348
      },
      {
        "name": "Cooking Oil",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.02529411765
      }
    ]
  },
  {
    "name": "Tuna Ciabatta",
    "menuGroup": "Ciabatta",
    "sellingPrice": 12.17,
    "totalCost": 0,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Avocado Paste",
        "unit": "gm",
        "qty": 34,
        "totalCost": 0.8373231358
      },
      {
        "name": "Tuna Mixture",
        "unit": "gm",
        "qty": 101,
        "totalCost": 1.985455072
      },
      {
        "name": "Tomato",
        "unit": "gm",
        "qty": 15,
        "totalCost": 0.0705
      },
      {
        "name": "Pesto",
        "unit": "gm",
        "qty": 8,
        "totalCost": 0.3591836735
      },
      {
        "name": "White Cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.16
      },
      {
        "name": "Lettuce",
        "unit": "gm",
        "qty": 3,
        "totalCost": 0.02127
      }
    ]
  },
  {
    "name": "Spicy Tuna Ciabatta",
    "menuGroup": "Ciabtta",
    "sellingPrice": 13.04,
    "totalCost": 0,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Avocado Paste",
        "unit": "gm",
        "qty": 34,
        "totalCost": 0.8373231358
      },
      {
        "name": "Tuna Mixture",
        "unit": "gm",
        "qty": 101,
        "totalCost": 1.985455072
      },
      {
        "name": "Tomato",
        "unit": "gm",
        "qty": 15,
        "totalCost": 0.0705
      },
      {
        "name": "Pesto",
        "unit": "gm",
        "qty": 8,
        "totalCost": 0.3591836735
      },
      {
        "name": "White Cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.16
      },
      {
        "name": "Lettuce",
        "unit": "gm",
        "qty": 3,
        "totalCost": 0.02127
      },
      {
        "name": "Jalapeno",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.06315789474
      },
      {
        "name": "Spicy Sauce - Shatta",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.5119047619
      }
    ]
  },
  {
    "name": "Double Cheese Burger With Egg",
    "menuGroup": "Burger",
    "sellingPrice": 13.91,
    "totalCost": 0,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Butter",
        "unit": "gm",
        "qty": 2,
        "totalCost": 0.0152
      },
      {
        "name": "Onion",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.0376
      },
      {
        "name": "Meat",
        "unit": "gm",
        "qty": 140,
        "totalCost": 3.22
      },
      {
        "name": "Yellow Cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.57348
      },
      {
        "name": "Burger Sauce",
        "unit": "gm",
        "qty": 54,
        "totalCost": 0.4524660691
      },
      {
        "name": "Egg Mixturw",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.6438628159
      },
      {
        "name": "Cooking Oil",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.02529411765
      }
    ]
  },
  {
    "name": "Halloumi Ciabatta",
    "menuGroup": "Ciabatta",
    "sellingPrice": 12.17,
    "totalCost": 2.8838,
    "foodCostPct": 23.7,
    "ingredients": [
      {
        "name": "Labna Zattar Mix",
        "unit": "gm",
        "qty": 26,
        "totalCost": 0.5716916996
      },
      {
        "name": "Halloumi 6pcs",
        "unit": "gm",
        "qty": 71,
        "totalCost": 1.562
      },
      {
        "name": "Dried Tomato",
        "unit": "gm",
        "qty": 11,
        "totalCost": 0.3362445415
      },
      {
        "name": "Olives 5pcs",
        "unit": "gm",
        "qty": 7,
        "totalCost": 0.04277777778
      },
      {
        "name": "Pesto",
        "unit": "gm",
        "qty": 8,
        "totalCost": 0.3591836735
      },
      {
        "name": "Rocca",
        "unit": "gm",
        "qty": 4,
        "totalCost": 0.01192
      }
    ]
  },
  {
    "name": "Chessy Turkey Ciabatta",
    "menuGroup": "Ciabatta",
    "sellingPrice": 13.04,
    "totalCost": 2.8324,
    "foodCostPct": 21.7,
    "ingredients": [
      {
        "name": "Avocado Paste",
        "unit": "gm",
        "qty": 26,
        "totalCost": 0.6403059273
      },
      {
        "name": "Turkey",
        "unit": "gm",
        "qty": 34,
        "totalCost": 0.85
      },
      {
        "name": "Mozzarella Cheese",
        "unit": "gm",
        "qty": 15,
        "totalCost": 0.247826087
      },
      {
        "name": "Yellow Cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.57348
      },
      {
        "name": "Pesto",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.4489795918
      },
      {
        "name": "Rocca",
        "unit": "gm",
        "qty": 4,
        "totalCost": 0.01192
      },
      {
        "name": "Egg Sauce",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.05985129301
      }
    ]
  },
  {
    "name": "Chessy Brisket",
    "menuGroup": "Pie",
    "sellingPrice": 12.17,
    "totalCost": 0,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Mozarella",
        "unit": "gm",
        "qty": 40,
        "totalCost": 0.6608695652
      },
      {
        "name": "Origano",
        "unit": "gm",
        "qty": 1,
        "totalCost": 0.1349765258
      },
      {
        "name": "Brisket",
        "unit": "gm",
        "qty": 30,
        "totalCost": 0.585
      },
      {
        "name": "Chipotle Sauce",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.1237614679
      }
    ]
  },
  {
    "name": "Chicken Pesto Pie",
    "menuGroup": "Pie",
    "sellingPrice": 12.17,
    "totalCost": 1.7323,
    "foodCostPct": 14.2,
    "ingredients": [
      {
        "name": "Chicken",
        "unit": "gm",
        "qty": 31,
        "totalCost": 0.4805
      },
      {
        "name": "Mozarella",
        "unit": "gm",
        "qty": 30,
        "totalCost": 0.4956521739
      },
      {
        "name": "Pesto",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.4489795918
      },
      {
        "name": "Dried Tomato",
        "unit": "gm",
        "qty": 6,
        "totalCost": 0.1834061135
      },
      {
        "name": "Chipotle Sauce",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.1237614679
      }
    ]
  },
  {
    "name": "Cheese Pepporoni Pesto Pie",
    "menuGroup": "Pie",
    "sellingPrice": 12.17,
    "totalCost": 0,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Tomato Paste",
        "unit": "gm",
        "qty": 8,
        "totalCost": 0.07389558233
      },
      {
        "name": "Mozarella",
        "unit": "gm",
        "qty": 30,
        "totalCost": 0.4956521739
      },
      {
        "name": "Pepronoi 5pcs",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.242
      },
      {
        "name": "Pesto",
        "unit": "gm",
        "qty": 13,
        "totalCost": 0.5836734694
      }
    ]
  },
  {
    "name": "Chessy Pesto Pie",
    "menuGroup": "Pie",
    "sellingPrice": 11.3,
    "totalCost": 0,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Mozarella",
        "unit": "gm",
        "qty": 30,
        "totalCost": 0.4956521739
      },
      {
        "name": "Pesto",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.4489795918
      },
      {
        "name": "Dried Tomato 4pcs",
        "unit": "gm",
        "qty": 6,
        "totalCost": 0.1834061135
      }
    ]
  },
  {
    "name": "Chicken Halloumi Pie",
    "menuGroup": "Pie",
    "sellingPrice": 12.17,
    "totalCost": 1.9629,
    "foodCostPct": 16.1,
    "ingredients": [
      {
        "name": "Pesto",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.4489795918
      },
      {
        "name": "Halloumi",
        "unit": "gm",
        "qty": 46,
        "totalCost": 1.012
      },
      {
        "name": "Dried Tomato",
        "unit": "gm",
        "qty": 7,
        "totalCost": 0.2139737991
      },
      {
        "name": "Olives",
        "unit": "gm",
        "qty": 4,
        "totalCost": 0.02444444444
      },
      {
        "name": "Chicken",
        "unit": "gm",
        "qty": 17,
        "totalCost": 0.2635
      }
    ]
  },
  {
    "name": "Halloumi Pie",
    "menuGroup": "Pie",
    "sellingPrice": 10.43,
    "totalCost": 1.6994,
    "foodCostPct": 16.3,
    "ingredients": [
      {
        "name": "Pesto",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.4489795918
      },
      {
        "name": "Halloumi",
        "unit": "gm",
        "qty": 46,
        "totalCost": 1.012
      },
      {
        "name": "Dried Tomato",
        "unit": "gm",
        "qty": 7,
        "totalCost": 0.2139737991
      },
      {
        "name": "Olives",
        "unit": "gm",
        "qty": 4,
        "totalCost": 0.02444444444
      }
    ]
  },
  {
    "name": "Mix Cheese",
    "menuGroup": "Pie",
    "sellingPrice": 10.43,
    "totalCost": 0.998,
    "foodCostPct": 9.6,
    "ingredients": [
      {
        "name": "Mozarella",
        "unit": "gm",
        "qty": 40,
        "totalCost": 0.6608695652
      },
      {
        "name": "Akawi",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.2022
      },
      {
        "name": "Origano",
        "unit": "gm",
        "qty": 1,
        "totalCost": 0.1349765258
      }
    ]
  },
  {
    "name": "Chicken Mozarella Pie",
    "menuGroup": "Pie",
    "sellingPrice": 11.3,
    "totalCost": 1.1075,
    "foodCostPct": 9.8,
    "ingredients": [
      {
        "name": "Tomato Paste",
        "unit": "gm",
        "qty": 8,
        "totalCost": 0.07389558233
      },
      {
        "name": "Chicken",
        "unit": "gm",
        "qty": 26,
        "totalCost": 0.403
      },
      {
        "name": "Mozarella Sticks",
        "unit": "gm",
        "qty": 30,
        "totalCost": 0.4956521739
      },
      {
        "name": "Origano",
        "unit": "gm",
        "qty": 1,
        "totalCost": 0.1349765258
      }
    ]
  },
  {
    "name": "Zattar Mozarella",
    "menuGroup": "Pie",
    "sellingPrice": 7.83,
    "totalCost": 0,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Zattar",
        "unit": "gm",
        "qty": 23,
        "totalCost": 0.115
      },
      {
        "name": "Mozarella",
        "unit": "gm",
        "qty": 22,
        "totalCost": 0.3634782609
      }
    ]
  },
  {
    "name": "Zattar Pie",
    "menuGroup": "Pie",
    "sellingPrice": 6.96,
    "totalCost": 0,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Zattar",
        "unit": "gm",
        "qty": 30,
        "totalCost": 0.15
      }
    ]
  },
  {
    "name": "Akawi Pie",
    "menuGroup": "Pie",
    "sellingPrice": 6.96,
    "totalCost": 0,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Akawi",
        "unit": "gm",
        "qty": 35,
        "totalCost": 0
      }
    ]
  },
  {
    "name": "Chicken Philly",
    "menuGroup": "Sandwhich",
    "sellingPrice": 0,
    "totalCost": 3.8827,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Samoli",
        "unit": "gm",
        "qty": 1,
        "totalCost": 0.11
      },
      {
        "name": "Chicken",
        "unit": "gm",
        "qty": 100,
        "totalCost": 1.7
      },
      {
        "name": "Yellow cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.57
      },
      {
        "name": "yellow onion]",
        "unit": "gm",
        "qty": 8,
        "totalCost": 0.03008
      },
      {
        "name": "Maggi water",
        "unit": "gm",
        "qty": 20,
        "totalCost": 0.1599884287
      },
      {
        "name": "ghabashi sauce",
        "unit": "gm",
        "qty": 20,
        "totalCost": 0.2589411977
      },
      {
        "name": "butter",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.039
      },
      {
        "name": "kraft box",
        "unit": "gm",
        "qty": 1,
        "totalCost": 0.475
      },
      {
        "name": "cajun",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.3647058824
      },
      {
        "name": "pepper",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.175
      }
    ]
  },
  {
    "name": "Chicken Club Sandwich",
    "menuGroup": "Sandwhich",
    "sellingPrice": 0,
    "totalCost": 3.8317,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Samoli",
        "unit": "gm",
        "qty": 1,
        "totalCost": 0.11
      },
      {
        "name": "Egg mixture",
        "unit": "gm",
        "qty": 60,
        "totalCost": 0.6438628159
      },
      {
        "name": "Butter",
        "unit": "Gm",
        "qty": 3,
        "totalCost": 0.0228
      },
      {
        "name": "Tomato sliced",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.0564
      },
      {
        "name": "Lettuce",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.03545
      },
      {
        "name": "Chicken",
        "unit": "gm",
        "qty": 76,
        "totalCost": 1.292
      },
      {
        "name": "White Cheese Slice",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.2511013216
      },
      {
        "name": "Avocado Paste",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.2955258126
      },
      {
        "name": "ghabashi sauce",
        "unit": "gm",
        "qty": 27,
        "totalCost": 0.3495706169
      },
      {
        "name": "Turkey",
        "unit": "gm",
        "qty": 31,
        "totalCost": 0.775
      }
    ]
  },
  {
    "name": "Egg Bun Halloumi",
    "menuGroup": "Sandwhich",
    "sellingPrice": 0,
    "totalCost": 3.1622,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Bun",
        "unit": "gm",
        "qty": 55,
        "totalCost": 0.1006640350877193
      },
      {
        "name": "Halloumi",
        "unit": "gm",
        "qty": 30,
        "totalCost": 0.66
      },
      {
        "name": "Avocado Paste",
        "unit": "gm",
        "qty": 33,
        "totalCost": 0.8126959847
      },
      {
        "name": "Egg Sauce",
        "unit": "gm",
        "qty": 10,
        "totalCost": 0.119702586
      },
      {
        "name": "Rocca",
        "unit": "gm",
        "qty": 4,
        "totalCost": 0.01192
      },
      {
        "name": "Egg mixture",
        "unit": "gm",
        "qty": 80,
        "totalCost": 0.8584837545
      },
      {
        "name": "Yellow Cheese",
        "unit": "gm",
        "qty": 12,
        "totalCost": 0.57348
      },
      {
        "name": "Cooking Oil",
        "unit": "gm",
        "qty": 5,
        "totalCost": 0.02529411765
      }
    ]
  },
  {
    "name": "EGG and Philly Cheesesteak",
    "menuGroup": "Plate",
    "sellingPrice": 0,
    "totalCost": 7.5066,
    "foodCostPct": 0,
    "ingredients": [
      {
        "name": "Steak",
        "unit": "gm",
        "qty": 140,
        "totalCost": 4.34
      },
      {
        "name": "Egg mixture",
        "unit": "gm",
        "qty": 80,
        "totalCost": 0.8584837545
      },
      {
        "name": "Fries",
        "unit": "gm",
        "qty": 180,
        "totalCost": 0.954
      },
      {
        "name": "Yellow Cheese",
        "unit": "gm",
        "qty": 24,
        "totalCost": 1.14696
      },
      {
        "name": "Ghabashi Sauce",
        "unit": "gm",
        "qty": 16,
        "totalCost": 0.2071529582
      }
    ]
  }
]
