import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { IconFacebook, IconGithub } from '@/assets/brand-icons'
import { loginUser } from '@/stores/slices/authSlice'
import { AppDispatch, RootState } from '@/stores'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(7, 'Password must be at least 7 characters long'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  
  const { loading } = useSelector((state: RootState) => state.auth)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    const resultAction = await dispatch(loginUser(data))

    if (loginUser.fulfilled.match(resultAction)) {
      // ✅ FIXED: Using optional chaining to prevent 'undefined' crash
      const user = resultAction.payload?.user
      const displayName = user?.name || data.email 
      
      toast.success(`Welcome back, ${displayName}!`)

      // ✅ Redirect Logic based on role
      if (user?.role === 'super_admin') {
        navigate({ to: '/admin', replace: true })
      } else {
        const targetPath = redirectTo || '/dashboard'
        navigate({ to: targetPath, replace: true })
      }
    } else {
      // ✅ Handle payload properly if it's an object or a string
      const errorMessage = typeof resultAction.payload === 'string' 
        ? resultAction.payload 
        : 'Invalid credentials'
        
      toast.error(errorMessage)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute end-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={loading} type='submit'>
          {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <LogIn className='h-4 w-4 mr-2' />}
          Sign in
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline' type='button' disabled={loading}>
            <IconGithub className='h-4 w-4 mr-2' /> GitHub
          </Button>
          <Button variant='outline' type='button' disabled={loading}>
            <IconFacebook className='h-4 w-4 mr-2' /> Facebook
          </Button>
        </div>
      </form>
    </Form>
  )
}