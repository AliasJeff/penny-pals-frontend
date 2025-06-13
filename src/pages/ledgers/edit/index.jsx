import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import {
    Input,
    Button,
    Avatar,
    Tabs,
    Dialog,
    ActionSheet,
} from '@nutui/nutui-react-taro'
import { ledgerService } from '../../../services'
import InvitePopup from '../../../components/InvitePopup'
import './index.less'

const LedgerEdit = () => {
    const router = useRouter()
    const { id } = router.params

    const [ledger, setLedger] = useState(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('1')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [showActionSheet, setShowActionSheet] = useState(false)
    const [actionSheetActions, setActionSheetActions] = useState([])
    // Add state for showing the invite popup
    const [showInvitePopup, setShowInvitePopup] = useState(false)

    // Fetch ledger data
    useEffect(() => {
        if (id) {
            fetchLedgerData()
        }
    }, [id])

    // Fetch ledger details and users
    const fetchLedgerData = async () => {
        setLoading(true)
        try {
            const ledgerData = await ledgerService.getLedger(id)
            console.log('ledgerData', ledgerData)
            setLedger(ledgerData)
            setName(ledgerData.name || '')
            setDescription(ledgerData.description || '')

            // Fetch ledger users
            const usersData = await ledgerService.listLedgerUsers(id)
            setUsers(usersData || [])
        } catch (error) {
            console.error('Error fetching ledger data:', error)
            Taro.showToast({
                title: '加载账本数据失败',
                icon: 'none',
            })
        } finally {
            setLoading(false)
        }
    }

    // Handle form submission
    const handleSubmit = async () => {
        if (!name.trim()) {
            Taro.showToast({
                title: '请输入账本名称',
                icon: 'none',
            })
            return
        }

        setSaving(true)
        try {
            await ledgerService.updateLedger({
                id,
                name,
                description,
            })

            Taro.showToast({
                title: '保存成功',
                icon: 'success',
            })
        } catch (error) {
            console.error('Error updating ledger:', error)
            Taro.showToast({
                title: '保存失败，请重试',
                icon: 'none',
            })
        } finally {
            setSaving(false)
        }
    }

    // Handle name change
    const handleNameChange = (value) => {
        setName(value)
    }

    // Handle description change
    const handleDescriptionChange = (value) => {
        setDescription(value)
    }

    // Add new member - show invite popup instead of navigating
    const handleAddMember = () => {
        setShowInvitePopup(true)
    }

    // Open member action sheet
    const handleMemberAction = (user) => {
        setSelectedUserId(user.id)

        const actions = [
            { name: '设置角色', color: '#4670FF' },
            { name: '移除成员', color: '#ff4f4f' },
        ]

        setActionSheetActions(actions)
        setShowActionSheet(true)
    }

    // Handle action sheet selection
    const handleActionSelect = (index) => {
        setShowActionSheet(false)

        // Handle based on action index
        if (index === 0) {
            // Set role
            showRoleActionSheet()
        } else if (index === 1) {
            // Remove member
            setShowDeleteConfirm(true)
        }
    }

    // Show role selection action sheet
    const showRoleActionSheet = () => {
        const roleActions = [
            { name: '成员', subname: '普通成员权限' },
            { name: '所有者', subname: '管理员权限' },
        ]

        setActionSheetActions(roleActions)
        setTimeout(() => {
            setShowActionSheet(true)
        }, 300)
    }

    // Confirm remove member
    const confirmRemoveMember = async () => {
        try {
            await ledgerService.removeUserFromLedger(id, selectedUserId)

            Taro.showToast({
                title: '已移除成员',
                icon: 'success',
            })

            // Refresh member list
            fetchLedgerData()
        } catch (error) {
            console.error('Error removing member:', error)
            Taro.showToast({
                title: '操作失败，请重试',
                icon: 'none',
            })
        } finally {
            setShowDeleteConfirm(false)
            setSelectedUserId(null)
        }
    }

    // Change member role
    const changeMemberRole = async (index) => {
        const newRole = index === 0 ? 'member' : 'owner'

        try {
            await ledgerService.updateLedgerUserRole({
                ledgerId: id,
                userId: selectedUserId,
                role: newRole,
            })

            Taro.showToast({
                title: '角色已更新',
                icon: 'success',
            })

            // Refresh member list
            fetchLedgerData()
        } catch (error) {
            console.error('Error updating role:', error)
            Taro.showToast({
                title: '操作失败，请重试',
                icon: 'none',
            })
        } finally {
            setSelectedUserId(null)
        }
    }

    // Handle closing invite popup and refresh members list
    const handleInviteClose = () => {
        setShowInvitePopup(false)
        // Refresh the member list after inviting
        fetchLedgerData()
    }

    return (
        <View className="ledger-edit-page">
            <View className="ledger-edit-header">
                <Text className="ledger-edit-header__title">编辑账本</Text>
            </View>

            <Tabs
                value={activeTab}
                onChange={(value) => setActiveTab(value)}
                type="smile"
                className="ledger-edit-tabs"
            >
                <Tabs.TabPane title="基本信息" value="1">
                    <View className="ledger-edit-form">
                        <View className="input-field">
                            <View className="input-label">
                                <Text>账本名称</Text>
                            </View>
                            <Input
                                placeholder="请输入账本名称"
                                value={name}
                                onChange={handleNameChange}
                                maxLength={20}
                            />
                        </View>

                        <View className="input-field">
                            <View className="input-label">
                                <Text>账本描述</Text>
                            </View>
                            <Input
                                placeholder="请输入账本描述（选填）"
                                maxLength={40}
                                value={description}
                                onChange={handleDescriptionChange}
                            />
                        </View>
                    </View>

                    <View className="ledger-edit-submit">
                        <Button
                            type="primary"
                            block
                            loading={saving}
                            onClick={handleSubmit}
                        >
                            保存
                        </Button>
                    </View>
                </Tabs.TabPane>

                <Tabs.TabPane title="成员管理" value="2">
                    <View className="ledger-edit-members">
                        {users.length > 0 && (
                            <View className="ledger-edit-members-list">
                                {users.map((user) => (
                                    <View
                                        key={user.id}
                                        className="ledger-edit-member"
                                        onClick={() => handleMemberAction(user)}
                                    >
                                        <Avatar
                                            size="small"
                                            background="#4670FF"
                                            color="#FFFFFF"
                                            className="ledger-edit-member__avatar"
                                        >
                                            {user.username?.substring(0, 1) ||
                                                '...'}
                                        </Avatar>
                                        <View className="ledger-edit-member__info">
                                            <Text className="ledger-edit-member__name">
                                                {user.username || '用户'}
                                            </Text>
                                            <Text className="ledger-edit-member__role">
                                                {user.role === 'owner'
                                                    ? '所有者'
                                                    : '成员'}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View className="ledger-edit-add-member">
                            <Button
                                block
                                type="default"
                                onClick={handleAddMember}
                            >
                                ➕ 添加成员
                            </Button>
                        </View>
                    </View>
                </Tabs.TabPane>
            </Tabs>

            {/* Delete confirmation dialog */}
            <Dialog
                title="删除确认"
                visible={showDeleteConfirm}
                onConfirm={confirmRemoveMember}
                onCancel={() => {
                    setShowDeleteConfirm(false)
                    setSelectedUserId(null)
                }}
            >
                确认要移除此成员吗？
            </Dialog>

            {/* Action Sheet for member actions */}
            <ActionSheet
                visible={showActionSheet}
                cancelTxt="取消"
                options={actionSheetActions}
                onSelect={(index) => {
                    if (activeTab === '2') {
                        if (actionSheetActions[0].subname) {
                            // Role selection
                            changeMemberRole(index)
                        } else {
                            // Action selection
                            handleActionSelect(index)
                        }
                    }
                    setShowActionSheet(false)
                }}
                onCancel={() => setShowActionSheet(false)}
            />

            {/* Invite popup */}
            <InvitePopup 
                visible={showInvitePopup}
                onClose={handleInviteClose}
                ledgerId={id}
            />
        </View>
    )
}

export default LedgerEdit
