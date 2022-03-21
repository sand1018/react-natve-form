import React, { useContext, useEffect, useState, useMemo } from 'react'
import { View, StyleSheet, Text, ViewStyle, TextStyle, } from 'react-native'
import { RuleItem } from 'async-validator';
import { FormContext } from './context'


type StatusType = 'passed' | 'default' | 'error'

export type ListenerType = {
  acceptValidateResult: ((result: { status: StatusType, errMessage: string }) => void)
  prop: string
  rules: RuleItem[]
}

export type StylesType = {
  formItem: ViewStyle
  label: ViewStyle
  labelText: TextStyle,
  formContent: ViewStyle
}


type Props = {
  labelPosition?: 'left' | 'right' | 'top'
  label: string
  children: Element
  labelWidth?: number
  prop?: string
  hideRequiredAsterisk?: boolean,
  rules?: RuleItem[]
  style?: StylesType
  showBorder?: boolean
}


export default function FormItem(props: Props) {
  const {
    label,
    labelPosition = 'left',
    prop = '',
    children,
    labelWidth,
    hideRequiredAsterisk,
    rules: currentItemRules = [],
    style = { formItem: {}, label: {}, labelText: {}, formContent: {} },
    showBorder
  } = props

  const [errMsg, setErrMsg] = useState('') // 错误信息
  const [status, setStatus] = useState<StatusType>('default') // 校验状态
  const [isRequired, setIsRequired] = useState(false) // 是否必填


  const context = useContext(FormContext)

  const {
    rules,
    addListener,
    deleteListener
  } = context


  const hideAsterisk = useMemo(() => {
    const hide = hideRequiredAsterisk !== undefined ? hideRequiredAsterisk : context?.hideRequiredAsterisk
    if (hide) { // 当设置隐藏 * 号时直接隐藏
      return true
    } else { // 当设置显示 * 时，根据设置的校验规则是否显示 * 号，当有必填项时显示，当没有必填项时不显示
      if (isRequired) {
        return false
      } else {
        return true
      }
    }
  }, [hideRequiredAsterisk, context?.hideRequiredAsterisk, isRequired])


  useEffect(() => {
    const currentRules = rules[prop] || []
    let currentAllRules: RuleItem[] = []
    if (Array.isArray(currentRules)) {  // 合并 Form 与 FormItem 中校验规则
      currentAllRules = [...currentRules, ...currentItemRules]
    } else {
      currentAllRules = [...currentItemRules, currentRules]
    }
    const required = currentAllRules.filter(item => item.required == true).length > 0; // 动态添加必填 * 号提醒
    setIsRequired(required)
    addListener && addListener({ prop, acceptValidateResult, rules: currentAllRules }) // 动态添加校验规则
  }, [rules, currentItemRules])



  useEffect(() => {
    return () => {
      deleteListener && deleteListener(prop)
    }
  }, [])


  const acceptValidateResult: ListenerType["acceptValidateResult"] = (result) => {
    const { status, errMessage } = result
    setStatus(status)
    setErrMsg(errMessage)
  }


  return (
    <>
      <View style={{
        ...styles.formItem,
        flexDirection: labelPosition === 'top' ? 'column' : 'row',
        borderBottomWidth: (showBorder !== undefined ? showBorder : context?.showBorder) ? StyleSheet.hairlineWidth : 0,
        ...style?.formItem
      }}>
        <View style={{ width: labelWidth !== undefined ? labelWidth : context?.labelWidth, ...styles.label, }}>
          <Text style={{ textAlign: labelPosition === 'top' ? 'left' : labelPosition }}>
            {!hideAsterisk && <Text style={styles.asterisk}>*</Text>}
            <Text style={{ ...styles.labelText, ...style?.labelText }}>
              {label}
            </Text>
          </Text>
        </View>
        <View style={{ flex: labelPosition === 'top' ? 0 : 1, ...style?.formContent }}>
          {children}
          {status === 'error' ? <Text style={styles.errText}>{errMsg}</Text> : null}
        </View>
      </View>
    </>
  )
}


const styles = StyleSheet.create({
  formItem: {
    borderColor: '#EBEDED',
    paddingVertical: 6
  },
  asterisk: {
    color: '#FF3333',
    marginRight: 2
  },
  label: {
    height: 'auto',
    paddingVertical: 10,
    paddingRight: 8,
    justifyContent: 'center',
    fontSize: 15
  },
  labelText: {
    color: '#0D171A',
    fontWeight: '700',
  },
  errText: {
    fontSize: 11,
    color: '#FF3333',
    marginBottom: 4,
    position: 'absolute',
    bottom: -5
  },
})
