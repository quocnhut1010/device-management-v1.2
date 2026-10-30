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
import { useToast } from '../../hooks/use-toast'
import { Lock } from 'lucide-react'

interface ChangePasswordDialogProps {
  open: boolean
  onClose: () => void
}

interface FormErrors {
  oldPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export function ChangePasswordDialog({ open, onClose }: ChangePasswordDialogProps) {
  const { toast } = useToast()

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setErrors({})
      setIsSubmitting(false)
    }
  }, [open])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: FormErrors = {}

    if (!oldPassword.trim()) {
      newErrors.oldPassword = 'Mật khẩu cũ là bắt buộc'
    }

    if (!newPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự'
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự'
    } else if (newPassword === oldPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu cũ'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc'
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setIsSubmitting(true)

      // Simulate API change password latency
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: 'Thành công',
        description: 'Đổi mật khẩu thành công',
      })

      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setErrors({})
      onClose()
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Đã xảy ra lỗi khi đổi mật khẩu'
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Lock className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">Đổi mật khẩu</DialogTitle>
          </div>
          <DialogDescription>
            Cập nhật mật khẩu của bạn để bảo vệ tài khoản tốt hơn
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
            <Input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value)
                if (errors.oldPassword) setErrors((prev) => ({ ...prev, oldPassword: undefined }))
              }}
              placeholder="Nhập mật khẩu cũ"
            />
            {errors.oldPassword && (
              <p className="text-sm text-destructive">{errors.oldPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }))
              }}
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
              }}
              placeholder="Nhập lại mật khẩu mới"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang đổi mật khẩu...' : 'Cập nhật mật khẩu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ChangePasswordDialog
