import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, User, Lock } from 'lucide-react';

const Register = () => {
  const { register, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) {
      toast.error('Please fill in all fields.');
      return;
    }
    
    try {
      const { error } = await register({
        email,
        username,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Registration successful! Please check your email to verify your account.');
        navigate('/login');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    }
  };

  return (
    <div className="container relative flex h-[100dvh] flex-col items-center justify-center md:grid lg:max-w-none lg:px-0">
      <Card className="w-[360px] bg-background shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              placeholder="mail@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">
              <User className="mr-2 h-4 w-4" />
              Username
            </Label>
            <Input
              id="username"
              placeholder="Pick a username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">
              <Lock className="mr-2 h-4 w-4" />
              Password
            </Label>
            <Input
              id="password"
              placeholder="Enter password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit}>Create account</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
