import Axios from 'axios'
export const Testuri = 'http://ixiaomu.cn:3010/'///小木服务器数据库 3008正式 3010测试

export default {
    obs: function (params, f1, f2) {
        return Axios.post(Testuri + 'obs', params, f1, f2)
    },
}