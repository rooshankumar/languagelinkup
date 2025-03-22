
import React from 'react';
import { User } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface UserPreviewCardProps {
  user: {
    id: string;
    avatar_url?: string;
    username: string;
    age?: number;
    bio?: string;
    native_language?: string;
    learning_language?: string;
  };
  onClick: () => void;
}

const UserPreviewCard = ({ user, onClick }: UserPreviewCardProps) => {
  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer" 
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{user.username}</p>
          {user.age && <p className="text-sm text-muted-foreground">{user.age} years old</p>}
          {user.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {user.bio}
            </p>
          )}
          <div className="mt-1 flex items-center text-xs text-muted-foreground">
            <span>{user.native_language}</span>
            <span className="mx-2">→</span>
            <span>{user.learning_language}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserPreviewCard;
