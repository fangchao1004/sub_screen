import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Tag } from 'antd';
import moment from 'moment';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import HttpApi from '../util/HttpApi';
function queenChange(list) {
    let copyList = JSON.parse(JSON.stringify(list))
    copyList.forEach((item, index) => {
        if (index % 2 === 1) {
            copyList[index - 1]['next'] = item
        }
    })
    let afterFilter = copyList.filter((item) => {
        return item['next']
    })
    if (copyList.length % 2 === 1) {
        afterFilter = [...afterFilter, copyList[copyList.length - 1]]
    }
    return afterFilter
}

export default _ => {
    const [isFullScreen, setIsFullScreen] = useState(document.isFullScreen || document.webkitIsFullScreen)
    const [data, setData] = useState([])
    const [timeStr, setTimeStr] = useState('')
    const columns = [{
        title: '时间', width: 100, dataIndex: 'createdAt', key: 'createdAt', render: (_, record) => {
            return <span style={{ color: '#1890ff' }}>{moment(record.createdAt).format('HH:mm:ss')}</span>
        }
    },
    {
        title: '照片', dataIndex: 'fid', key: 'fid', render: (_, record) => {
            const imgUrl = 'https://xiaomei-face.oss-cn-hangzhou.aliyuncs.com/' + record.gid + '/' + record.sid + '/' + record.did + '/' + record.uid + '/' + record.fid + '.png'
            return <img style={{ width: 50, height: 50 }} src={imgUrl} alt='' />
        }
    },
    {
        title: '时间', width: 100, dataIndex: 'createdAt_next', key: 'createdAt_next', render: (_, record) => {
            return record.next ? <span style={{ color: '#1890ff' }}>{moment(record.next.createdAt).format('HH:mm:ss')}</span> : ''
        }
    },
    {
        title: '照片', dataIndex: 'next', key: 'fid_next', render: (_, record) => {
            let imgUrl = 'https://xiaomei-face.oss-cn-hangzhou.aliyuncs.com/' + record.gid + '/' + record.sid + '/' + record.did + '/' + record.uid + '/' + record.fid + '.png'
            if (record.next) {
                imgUrl = 'https://xiaomei-face.oss-cn-hangzhou.aliyuncs.com/' + record.next.gid + '/' + record.next.sid + '/' + record.next.did + '/' + record.next.uid + '/' + record.next.fid + '.png'
            }
            return record.next ? <img style={{ width: 50, height: 50 }} src={imgUrl} alt='' /> : ''
        }
    },
    ]
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
    const getFaceData = useCallback(async () => {
        let startOfDay = moment().startOf('day').format('YYYY-MM-DD HH:mm:ss')
        let endOfDay = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')

        let sql = `select * from faces where createdAt>='${startOfDay}' and createdAt<='${endOfDay}' order by id desc limit 20`
        let result = await HttpApi.obs({ sql })
        if (result.data.code === 0) {
            let afterQueen = queenChange(result.data.data.map((item, index) => { item.key = index; return item }))
            setData(afterQueen)
        }
    }, [])
    useEffect(() => {
        window.onresize = () => {
            setIsFullScreen(document.isFullScreen || document.webkitIsFullScreen)
        }
        let loop = setInterval(() => {
            setTimeStr(moment().format('YYYY-MM-DD HH:mm:ss'))
        }, 1000)
        let loop2 = setInterval(() => {
            getFaceData()
        }, 1000)
        return () => {
            clearInterval(loop)
            clearInterval(loop2)
        }
    }, [getFaceData])
    return <div style={styles.root}>
        <Table
            title={() => <div style={styles.title}><h2>今日到访</h2><span><Tag color='#85a5ff' style={{ fontSize: 20 }}>{timeStr}</Tag>
                <Button style={styles.icon} icon={!isFullScreen ? <FullscreenOutlined /> : <FullscreenExitOutlined />} type="ghost" onClick={() => {
                    handleFullScreen()
                }}></Button></span></div>}
            bordered
            columns={columns}
            dataSource={data}
            pagination={false}
        />
    </div>
}
const styles = {
    root: {
        width: '100%',
        height: '100vh',
        // backgroundColor: '#FFFFFF',
        // padding: 24
    },
    titleTime: {
        marginLeft: 20,
        color: '#1890ff'
    },
    title: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    icon: {
        marginLeft: 20
    }
}