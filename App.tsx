import { RuleItem, Rules } from 'async-validator';
import React, { ReactElement, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { Form, FormItem } from './src/index'
import useFormStore from './src/useFormStore'



const rules: Rules = {
  name: [
    { required: true, message: '请输入姓名' },

  ],
  age: [
    { required: true, message: '请输入年龄' },
  ],
  email: [
    {
      type: 'email', message: '请输入正确邮箱地址'
    }
  ],
  phone: []
}

const App: () => ReactElement = () => {

  const ref = useRef<ObjectType>()

  const { formData, setValue, resetForm } = useFormStore({})
  const [passed, setPassed] = useState(true)
  const [emailRules, setEmailRules] = useState<Array<RuleItem>>([])
  const [phoneRules, setPhoneRules] = useState<Array<RuleItem>>([])

  const handleSubmit = () => {
    ref.current?.validate((res: boolean) => {
      console.log(res)
      setPassed(res)
    })
  }

  const handleResetForm = () => {
    resetForm()
    setEmailRules([])
    setPhoneRules([])
    ref.current?.clearValidate()
  }

  const handleValidateProp = (prop: string) => {
    ref.current?.validateField(prop, (res: boolean) => {
      setPassed(res)
    })
  }


  return (
    <SafeAreaView >
      <View style={{ paddingHorizontal: 18 }}>
        <Form data={formData} rules={rules} labelWidth={80} ref={ref}>
          <FormItem label="姓名" prop="name" rules={[{ max: 12, min: 2, message: '长度在2-12' }]}>
            <TextInput
              style={{ flex: 1 }}
              value={formData.name}
              placeholder="name"
              onChangeText={text => setValue('name', text)}
              onBlur={() => { handleValidateProp('name') }}
            />
          </FormItem>
          <FormItem label="年龄" prop="age">
            <TextInput
              style={{ flex: 1 }}
              value={formData.age}
              placeholder="age"
              onChangeText={text => setValue('age', text)}
              onBlur={() => { handleValidateProp('age') }}
            />
          </FormItem>
          <FormItem
            label="邮箱"
            prop="email"
            rules={emailRules}
          >
            <TextInput
              style={{ flex: 1 }}
              value={formData.email}
              placeholder="email"
              onChangeText={text => {
                setValue('email', text)
                if (text) {
                  setPhoneRules([{ type: 'string', message: '请输入手机号', required: true }])
                } else {
                  setPhoneRules([])
                }
              }}
              onBlur={() => { handleValidateProp('email') }}
            />
          </FormItem>
          <FormItem
            label="手机号"
            prop="phone"
            rules={phoneRules}
          >
            <TextInput
              style={{ flex: 1 }}
              value={formData.phone}
              placeholder="phone"
              onChangeText={text => {
                setValue('phone', text)
                if (text) {
                  setEmailRules([{ message: '请输入邮箱', required: true }])
                } else {
                  setEmailRules([])
                }
              }}
              onBlur={() => { handleValidateProp('phone') }}
            />
          </FormItem>
        </Form>
        <TouchableOpacity onPress={handleSubmit} style={styles.btn}>
          <Text style={styles.btnText}>
            提交
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleResetForm} style={styles.btn}>
          <Text style={styles.btnText}>
            重置表单
          </Text>
        </TouchableOpacity>
        <Text style={{ marginTop: 30, color: 'red' }}>
          {passed ? '校验通过' : '校验不通过'}
        </Text>
      </View>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#00B9EF',
    borderRadius: 8,
    marginTop: 20,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnText: {
    color: "#fff",
    fontSize: 15,

  }
});

export default App;
