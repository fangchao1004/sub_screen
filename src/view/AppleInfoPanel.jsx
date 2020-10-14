import React, { useCallback } from 'react';
import { Modal, Tag, Table, Descriptions } from 'antd';
export default props => {
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
            title: '物料', dataIndex: 'store_name',
            render: (text, record) => {
                if (record.isSum) {
                    return <Tag color={'#f5222d'}>{text}</Tag>
                }
                return text
            }
        }, {
            title: '数量', dataIndex: 'count',
            render: (text, record) => {
                if (record.isSum) {
                    return <Tag color={'red'}>{text}</Tag>
                }
                return text
            }
        }, {
            title: '单价【元】', dataIndex: 'price',
            render: (text, record) => {
                if (record.isSum) {
                    return <Tag color={'red'}>{text}</Tag>
                }
                return text
            }
        }]
        return <>
            <div style={styles.title}>物料信息</div>
            <Table
                style={{ width: '100%', marginTop: 20 }}
                bordered
                columns={columns}
                dataSource={data}
                pagination={false}
            />
            <Descriptions title="申请人信息" bordered size="large" column={2} style={{ marginTop: 20 }}>
                <Descriptions.Item label="姓名">{props.data.name}</Descriptions.Item>
                <Descriptions.Item label="部门">{props.data.level_name}</Descriptions.Item>
                <Descriptions.Item label="专业">{props.data.major_name_all}</Descriptions.Item>
                <Descriptions.Item label="联系方式">{props.data.username}</Descriptions.Item>
            </Descriptions>
        </>
    }, [props.data])
    return <Modal
        title='申请单数据'
        destroyOnClose
        maskClosable={false}
        width={styles.rootPanel.width}
        // style={{ paddingTop: 0 }}
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
    }
}