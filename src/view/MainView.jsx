import React, { useState, useEffect, useCallback } from 'react';
import HttpApi from '../util/HttpApi';
import AppleInfoPanel from './AppleInfoPanel';
import '../css/demo.css'
import '../css/normalize.css'
import '../css/style.css'
import { Row, Col } from 'antd';
import FaceView from './FaceView';
import moment from 'moment';
import api from '../util/api';
let lastCode = '';
export default _ => {
    const [data, setData] = useState({})
    const [visible, setVisible] = useState(false)

    const getData = useCallback(async () => {
        let sql = `select t1.*,group_concat(u_m_j.mj_id) as major_id_all,group_concat(majors.name) as major_name_all from
        (select orders.*,users.name,users.permission,users.username,users.faceid,
        levels.name as level_name from order_search_list 
        left join (select * from orders where isdelete = 0) orders on orders.code = order_search_list.order_code
        left join (select * from users where effective = 1) users on users.id = orders.create_user
        left join (select * from levels where effective = 1)levels on levels.id = users.level_id
        where order_search_list.is_read = 0 
        order by order_search_list.id desc limit 1) t1
        left join (select * from user_map_major where effective = 1) u_m_j on u_m_j.user_id = t1.create_user
        left join (select * from majors  where effective = 1) majors on majors.id = u_m_j.mj_id
        group by id
        `
        let result = await HttpApi.obs({ sql })
        if (result.data.code === 0 && result.data.data.length > 0) {
            // console.log('查询的code:', result.data.data[0].code)
            // console.log('上次的code:', lastCode)
            if (result.data.data[0].code !== lastCode) {
                console.log('order新的搜索记录；展示')
                let content_list = JSON.parse(result.data.data[0].content)
                // console.log('content_list:', content_list)
                let response_store = await api.findStore(content_list.map((item) => item.store_id))
                if (response_store.data.code === 0) {
                    // console.log('response_store:', response_store.data.data)
                    content_list.forEach((item) => {
                        response_store.data.data.forEach((ele) => {
                            if (item.store_id === ele.id) {
                                item.tags = ele.tags
                            }
                        })
                    })
                }
                result.data.data[0].content = JSON.stringify(content_list)
                // console.log(object)
                lastCode = result.data.data[0].code
                let faceid = result.data.data[0].faceid
                let data = result.data.data[0];
                let sql = `select id,gid,sid,did,uid,fid from faces where uid = '${faceid}' order by id limit 1` ///以最早的照片作为证件照
                let result2 = await HttpApi.obs({ sql })
                if (result2.data.code === 0) {
                    let { gid, sid, fid, did, uid } = result2.data.data[0]
                    data = { ...data, gid, sid, fid, did, uid }
                }
                let sql3 = `select * from faces where createdAt>'${moment().add(-5, 'minutes').format('YYYY-MM-DD HH:mm:ss')}' order by id desc`
                let result3 = await HttpApi.obs({ sql: sql3 })
                if (result3.data.code === 0) {
                    let findList = []
                    for (let index = 0; index < result3.data.data.length; index++) {
                        const element = result3.data.data[index];
                        if (element.uid === faceid) {
                            findList.push(element);
                            break;
                        }
                    }
                    if (findList.length === 0) {
                        data = { ...data, capture_list: result3.data.data }
                    } else {
                        ///更新orders表中的capture_id字段
                        let sql4 = `update orders set capture_id = ${findList[0].id} where code = '${lastCode}'`
                        await HttpApi.obs({ sql: sql4 })
                        data = { ...data, capture_list: findList }
                    }
                }
                setData(data)
                setVisible(true)
            } else {
                console.log('order老的搜索记录；不展示')
            }
        } else { console.log('order没有最新数据'); setVisible(false); lastCode = ''; }
    }, [])
    const updateHandler = useCallback(async () => {
        let sql = `update order_search_list set is_read = 1 where order_code = ${lastCode}`
        await HttpApi.obs({ sql })
        lastCode = ''
    }, [])
    useEffect(() => {
        setInterval(() => {
            getData()
        }, 5000)
    }, [getData])
    return <div style={styles.root}>
        <AppleInfoPanel data={data} visible={visible} onClose={() => { setVisible(false); updateHandler() }} />
        <div className="satic-area">
            <div className="dynamic-area1"></div>
            <div className="dynamic-area2"></div>
            <div>
                <Row>
                    <Col span={16}>
                        <div id="weather-v2-plugin-standard"></div>
                    </Col>
                    <Col span={8}>
                        <div><FaceView /></div>
                    </Col>
                </Row>
            </div>
        </div>

    </div>
}
const styles = {
    root: {
        width: '100%',
        height: '100vh',
        backgroundColor: '#b5f5ec'
    },
}