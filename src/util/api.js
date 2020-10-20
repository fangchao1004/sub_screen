import axios from 'axios'
const SERVER_URL = 'http://ixiaomu.cn:3210/'

const api = {
  findStore: params =>
    axios.post(SERVER_URL + 'findStore', params),
}

export default api
