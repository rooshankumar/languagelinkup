const avatarUrl = sender?.profile_picture 
  ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/avatars/${sender.profile_picture}`
  : `https://ui-avatars.com/api/?name=${encodeURIComponent(sender?.username || 'User')}&background=random`;