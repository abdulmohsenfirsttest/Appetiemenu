export interface Category {
  id: number
  name_en: string
  name_ar: string
  sort_order: number
}

export interface MenuItem {
  id: number
  name_en: string
  name_ar: string
  price: number
  calories: number | null
  category_id: number
  category?: string
  image_url: string | null
  is_available: boolean
  sort_order: number
  hidden?: boolean
}

export interface Employee {
  id: number
  name: string
  iqama: string
  iban: string
  basic_salary: number
  position: string
  branch: string
  shift: string
  ot_hours: number
  ot_rate: number
  ot_pay: number
  net_pay: number
  salary_paid: boolean
  vacation_status: 'none' | 'on_vacation' | 'taken'
  restaurant?: string
}

export interface Branch {
  id: number
  name: string
  location: string
  is_active: boolean
}
