import React from 'react';
import { User, MapPin, Languages, Target } from 'lucide-react';

interface UserProfileCardProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
    location?: string;
    bio?: string;
    nativeLanguage?: string;
    learningLanguages?: Array<{
      language: string;
      proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Fluent';
    }>;
    learningGoals?: string;
    online?: boolean;
  };
  compact?: boolean;
  onClick?: () => void;
}

const UserProfileCard = ({ user, compact = false, onClick }: UserProfileCardProps) => {
  if (compact) {
    return (
      <div 
        className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover" 
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-muted flex items-center justify-center rounded-full">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            {user.online !== undefined && (
              <span className={`absolute bottom-0 right-0 w-3 h-3 ${user.online ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white`}></span>
            )}
          </div>
          <div>
            <h3 className="font-medium">{user.name}</h3>
            {user.location && (
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{user.location}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 text-sm">
          <div className="flex items-center gap-1 text-primary">
            <Languages className="h-4 w-4" />
            <span className="font-medium">
              {user.nativeLanguage} → {user.learningLanguages?.[0]?.language || "Learning..."}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover" 
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            ) : (
              <div className="w-20 h-20 bg-muted flex items-center justify-center rounded-full">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            {user.online !== undefined && (
              <span className={`absolute bottom-1 right-1 w-4 h-4 ${user.online ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white`}></span>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold">{user.name}</h3>
            {user.location && (
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{user.location}</span>
              </div>
            )}
          </div>
        </div>

        {user.bio && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">About Me</h4>
            <p className="text-sm">{user.bio}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Languages className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">Language Profile</h4>
              <p className="text-sm"><span className="font-medium">Native:</span> {user.nativeLanguage}</p>
              {user.learningLanguages && user.learningLanguages.length > 0 && (
                <div className="mt-1">
                  <p className="text-sm font-medium">Learning:</p>
                  <ul className="list-disc list-inside text-sm ml-1">
                    {user.learningLanguages.map((lang, index) => (
                      <li key={index}>
                        {lang.language} <span className="text-muted-foreground">({lang.proficiency})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {user.learningGoals && (
            <div className="flex items-start gap-2">
              <Target className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Learning Goals</h4>
                <p className="text-sm">{user.learningGoals}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;