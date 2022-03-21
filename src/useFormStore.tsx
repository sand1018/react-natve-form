import { useState, useEffect } from 'react'

export default function useFormStore(defVal: ObjectType = {}) {

  const [formData, setFormData] = useState<ObjectType>(defVal) // 表单值
  const [defaultForm, setDefaultForm] = useState<ObjectType>({}) // 表单初始值,用于重置表单


  useEffect(() => {
    setDefaultForm(defVal)
  }, [])


  // 重置表单
  const resetForm = () => {
    setFormData(defaultForm)
  }


  // 设置表单值
  const setValue = (key: string | ObjectType, value: any) => {
    if (typeof key === "string") {
      // 设置key对应的值
      setFormData((preForm) => {
        const newForm = { ...preForm }
        newForm[key] = value;
        return newForm
      })
    } else {   // 批量设置表单值
      const form = key;
      Object.keys(form).forEach(key => setValue(key, form[key]));
    }

  }

  // 获取表单值
  const getValue = (key?: string) => {
    // 判断是否传入key值，未传入key值则返回整个表单
    return key === undefined ? formData : formData[key];
  }



  return {
    setDefaultForm,
    resetForm,
    formData,
    getValue,
    setValue,
    setFormData
  }
}
