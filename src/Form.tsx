import React, { useState, forwardRef, useImperativeHandle } from 'react'
import Schema, { Rule, RuleItem, Rules, ValidateError } from 'async-validator';
import { ListenerType } from './FormItem'
import { FormContext } from './context'

type Props = {
  children: Element
  data?: ObjectType
  labelWidth?: number
  rules?: Rules,
  showBorder?: boolean
  hideRequiredAsterisk?: boolean
}

type ValidateCallbackType = (errors: boolean, errList?: ValidateError[]) => void


function Form(props: Props, ref: any) {
  const {
    children,
    rules = {},
    data = {},
    labelWidth = 80,
    showBorder = true,
    hideRequiredAsterisk = false
  } = props

  const [listeners, setListeners] = useState<Map<string, ListenerType>>(new Map())

  useImperativeHandle(ref, () => ({
    validate,
    clearValidate,
    validateField
  }))


  const validateFun = (
    prop: string,
    value: any,
    listener: ListenerType,
    callback: (errorsList: ValidateError[]) => void
  ) => {
    let currentRules = listener.rules
    const validator = new Schema({ [prop]: currentRules });
    validator.validate({ [prop]: value }, (errors) => {
      if (errors) {
        listener.acceptValidateResult({
          status: 'error',
          errMessage: errors[0]?.message || '校验错误'
        })
        callback && callback(errors)
      } else {
        listener.acceptValidateResult({ status: 'passed', errMessage: '' })
        callback && callback([])
      }
    })
  }

  // 校验整个表单
  const validate = (callback?: ValidateCallbackType) => {
    try {
      if (data) { // 未填写 form 属性则不校验
        let errList: ValidateError[] = []
        listeners.forEach(item => {
          validateFun(item.prop, data[item.prop], item, (errors) => {
            errList = errList.concat(errors)
          })
        })
        callback && callback(!errList.length, errList)
      }
    } catch (err) {
      console.error(err)
    }
  }


  // 校验单个属性
  const validateField = (prop: string, callback?: ValidateCallbackType) => {
    try {
      if (data) { // 未填写 form 属性则不校验
        if (listeners.has(prop)) {
          const listener = listeners?.get(prop)!
          validateFun(prop, data[prop], listener, (errors) => {
            callback && callback(!errors.length, errors)
          })
        } else { // FromItem 组件未填写prop属性，则直接通过
          callback && callback(true, [])
        }

      } else {
        throw new Error('表单内不存在该属性')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const addListener = (listener: ListenerType) => {
    const { prop } = listener
    setListeners((preListeners) => {
      const newListenrs = preListeners?.set(prop, listener)
      return newListenrs
    })
  }


  const deleteListener = (prop: string) => {
    setListeners((preListeners) => {
      preListeners?.delete(prop)
      return preListeners
    })
  }


  // 移除校验结果
  const clearValidate = () => {
    try {
      listeners.forEach(item => {
        item.acceptValidateResult({ status: 'default', errMessage: '' })
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <FormContext.Provider value={{
      rules,
      labelWidth,
      showBorder,
      hideRequiredAsterisk,
      addListener,
      deleteListener
    }}>
      {children}
    </FormContext.Provider>
  )
}


export default forwardRef(Form)
