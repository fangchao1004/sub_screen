import React, { useState, useEffect, useCallback } from 'react';
import HttpApi from '../util/HttpApi';
import AppleInfoPanel from './AppleInfoPanel';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons'
import '../css/demo.css'
import '../css/normalize.css'
import '../css/style.css'
import { Button } from 'antd';
let lastCode = '';
export default _ => {
    const [isFullScreen, setIsFullScreen] = useState(document.isFullScreen || document.webkitIsFullScreen)
    const [data, setData] = useState({})
    const [visible, setVisible] = useState(false)
    const handleFullScreen = useCallback(() => {
        let element = document.documentElement
        if (isFullScreen) {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen()
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen()
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen()
            }
        } else {
            if (element.requestFullscreen) {
                element.requestFullscreen()
            } else if (element.webkitRequestFullScreen) {
                element.webkitRequestFullScreen()
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen()
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen()
            }
        }
    }, [isFullScreen])
    const getData = useCallback(async () => {
        console.log('getData')
        let sql = `select t1.*,group_concat(u_m_j.mj_id) as major_id_all,group_concat(majors.name) as major_name_all from
        (select orders.*,users.name,users.permission,users.username,
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
                console.log('新的搜索记录；展示')
                lastCode = result.data.data[0].code
                setData(result.data.data[0])
                setVisible(true)
            } else {
                console.log('老的搜索记录；不展示')
            }
        } else { console.log('没有最新数据'); setVisible(false); lastCode = ''; }
    }, [])
    const updateHandler = useCallback(async () => {
        let sql = `update order_search_list set is_read = 1 where order_code = ${lastCode}`
        await HttpApi.obs({ sql })
        lastCode = ''
    }, [])
    useEffect(() => {
        window.onresize = () => {
            setIsFullScreen(document.isFullScreen || document.webkitIsFullScreen)
        }
        setInterval(() => {
            getData()
        }, 5000)
    }, [getData])
    return <div style={styles.root}>
        <AppleInfoPanel data={data} visible={visible} onClose={() => { setVisible(false); updateHandler() }} />
        <div className="satic-area">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={styles.icon}>
                    <div style={styles.icon} id="weather-v2-plugin-standard"></div>
                </div>
                <Button icon={!isFullScreen ? <FullscreenOutlined style={styles.icon} /> : <FullscreenExitOutlined style={styles.icon} />} style={{ zIndex: 10 }} type="ghost" onClick={() => {
                    handleFullScreen()
                }}></Button>
            </div>
            <div className="dynamic-area1"></div>
            <div className="dynamic-area2"></div>
        </div>
    </div >
}
const styles = {
    root: {
        width: '100%',
        height: '100vh',
        backgroundColor: '#b5f5ec'
    },
    icon: {
        zIndex: 10
    },
    timefont: {
        fontSize: 24,
        color: '#8c8c8c'
    }
}