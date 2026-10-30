import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../hooks/use-toast'
import type { UserDto } from '../../types'
import { formatDateTime } from '../../lib/dateUtils'

interface ProfileModalProps {
  open: boolean
  onClose: () => void
  user: UserDto | null
  onSuccess?: () => void
}

export function ProfileModal({ open, onClose, user, onSuccess }: ProfileModalProps) {
  const { profile: authUser } = useAuth()
  const { toast } = useToast()
  const isAdmin = authUser?.role?.toLowerCase() === 'admin'

  const [fullName, setFullName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorFullName, setErrorFullName] = useState('')

  useEffect(() => {
    if (user && open) {
      setFullName(user.fullName || '')
      setErrorFullName('')
    }
  }, [user, open])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!fullName.trim()) {
      setErrorFullName('Họ tên không được để trống')
      return
    }

    try {
      setIsSubmitting(true)

      // Persist to localStorage if stored
      const stored = localStorage.getItem('auth_user')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          parsed.fullName = fullName
          localStorage.setItem('auth_user', JSON.stringify(parsed))
        } catch {
          // ignore
        }
      }

      toast({
        title: 'Thành công',
        description: 'Cập nhật thông tin cá nhân thành công',
      })

      onSuccess?.()
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật thông tin'
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex flex-col items-center gap-4 mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder-user.jpg" alt={user.fullName} />
              <AvatarFallback className="text-lg">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <DialogTitle className="text-2xl">Thông tin cá nhân</DialogTitle>
              <DialogDescription className="mt-2">
                Cập nhật thông tin cá nhân của bạn
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ tên</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (errorFullName) setErrorFullName('')
              }}
              placeholder="Nhập họ tên"
            />
            {errorFullName && (
              <p className="text-sm text-destructive">{errorFullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email}
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Vai trò</Label>
            <Input
              id="role"
              value={user.role || (isAdmin ? 'Quản trị viên' : 'Nhân viên')}
              readOnly
              className="bg-muted"
            />
          </div>

          {user.departmentName && (
            <div className="space-y-2">
              <Label htmlFor="departmentName">Phòng ban</Label>
              <Input
                id="departmentName"
                value={user.departmentName}
                readOnly
                className="bg-muted"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="position">Vị trí</Label>
            <Input
              id="position"
              value={user.position || (isAdmin ? 'Quản trị viên' : 'Nhân viên')}
              readOnly
              className="bg-muted"
            />
          </div>

          {user.updatedAt && (
            <div className="text-sm text-muted-foreground text-center pt-2">
              Lần cập nhật: {formatDateTime(user.updatedAt)}
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Đóng
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ProfileModal
