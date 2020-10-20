import React, { useCallback } from 'react';
import { Modal, Tag, Table, Row, Col, Descriptions } from 'antd';
import '../css/style.css'
export default props => {
    let { gid, sid, fid, did, uid } = props.data;
    const imgUrl = 'https://xiaomei-face.oss-cn-hangzhou.aliyuncs.com/' + gid + '/' + sid + '/' + did + '/' + uid + '/' + fid + '.png'
    const RenderDetail = useCallback((record) => {
        let sum_price = 0;///总价
        let sum_count = 0;///总件数
        JSON.parse(record.content).forEach((item) => {
            sum_price = sum_price + item.count * item.price;
            sum_count = sum_count + item.count;
        })
        let tempList = JSON.parse(record.content);
        tempList.push({ store_name: '总计', count: sum_count, price: sum_price, isSum: true })
        let data = tempList.map((item, index) => { item.key = index; return item })
        const columns = [{
            title: <div style={styles.font1}>物料</div>, dataIndex: 'store_name',
            render: (text, record) => {
                if (record.isSum) {
                    return <Tag color={'#f5222d'} style={styles.font1}>{text}</Tag>
                }
                return <div style={styles.font1}>{text}</div>
            }
        }, {
            title: <div style={styles.font1}>数量</div>, dataIndex: 'count',
            render: (text, record) => {
                if (record.isSum) {
                    return <Tag color={'red'} style={styles.font1}>{text}</Tag>
                }
                return <div style={styles.font1}>{text}</div>
            }
        }, {
            title: <div style={styles.font1}>单价【元】</div>, dataIndex: 'price',
            render: (text, record) => {
                if (record.isSum) {
                    return <Tag color={'red'} style={styles.font1}>{text}</Tag>
                }
                return <div style={styles.font1}>{text}</div>
            }
        }]
        return <>
            <Row gutter={24}>
                <Col span={14}>
                    <div style={styles.title}>物料信息</div>
                    <Table
                        rowClassName={(record, index) => {
                            if (index < data.length - 1) {
                                if (index % 2 !== 0) {
                                    return 'row'
                                }
                                else { return '' }
                            } else {
                                return 'lastrow'
                            }
                        }}
                        style={{ width: '100%', marginTop: 20 }}
                        bordered
                        columns={columns}
                        dataSource={data}
                        pagination={false}
                    />
                </Col>
                <Col span={10}>
                    <Descriptions title="领料人信息" bordered size="large" column={2} >
                        <Descriptions.Item label={<div style={styles.font1}>{'姓名'}</div>}><div style={styles.font1}>{props.data.name}</div></Descriptions.Item>
                        <Descriptions.Item label={<div style={styles.font1}>{'照片'}</div>}>{imgUrl.indexOf('undefined') === -1 ? <img style={{ width: 3 * 30, height: 4 * 30 }} src={imgUrl} alt='' /> : '-'}</Descriptions.Item>
                        <Descriptions.Item span={2} label={<div style={styles.font1}>{'联系方式'}</div>}><div style={styles.font1}>{props.data.username}</div></Descriptions.Item>
                        <Descriptions.Item span={2} label={<div style={styles.font1}>{'部门'}</div>}><div style={styles.font1}>{props.data.level_name}</div></Descriptions.Item>
                        <Descriptions.Item span={2} label={<div style={styles.font1}>{'专业'}</div>}><div style={styles.font1}>{props.data.major_name_all}</div></Descriptions.Item>
                    </Descriptions>
                    <Descriptions bordered size="large" column={1} style={{ marginTop: 20 }}>
                        <Descriptions.Item label={<div style={styles.font1}>{'抓拍记录'}</div>}>{props.data.capture_list.length > 0 ? props.data.capture_list.map((item, index) => {
                            const imgUrl = 'https://xiaomei-face.oss-cn-hangzhou.aliyuncs.com/' + item.gid + '/' + item.sid + '/' + item.did + '/' + item.uid + '/' + item.fid + '.png'
                            return < img key={index} style={{ width: 3 * 30, height: 4 * 30, marginRight: 10 }} src={imgUrl} alt='' />
                        }) : '-'}</Descriptions.Item>
                    </Descriptions>
                </Col>
            </Row>
        </>
    }, [props.data, imgUrl])
    return <Modal
        title={<div style={styles.font1}>{`申请单【${props.data.code}】`}</div>}
        destroyOnClose
        maskClosable={false}
        width={styles.rootPanel.width}
        bodyStyle={{ paddingTop: 20 }}
        visible={props.visible}
        onCancel={() => { props.onClose() }}
        footer={null}
    >
        {props.visible ?
            <div style={{ minHeight: styles.rootPanel.height }}>{RenderDetail(props.data)}</div>
            : null}
    </Modal>
}
const styles = {
    rootPanel: {
        width: document.documentElement.clientWidth - 100,
        height: document.documentElement.clientHeight - 200
    },
    title: {
        color: 'rgba(0, 0, 0, 0.85)',
        fontWeight: 'bold',
        fontSize: ' 16px',
        lineHeight: 1.5715,
    },
    font1: {
        fontSize: 16
    },
}