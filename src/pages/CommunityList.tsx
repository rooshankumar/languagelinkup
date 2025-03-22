import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import UserPreviewCard from '@/components/UserPreviewCard';
import { supabase } from '@/lib/supabaseClient';

// Placeholder data for countries and languages.  Replace with your actual data.
const COUNTRIES = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  // Add more countries here...
];
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  // Add more languages here...
];

const FilterPanel = ({ filters, onFilterChange, countries, languages }) => {
  const [gender, setGender] = useState(filters.gender || '');
  const [ageRange, setAgeRange] = useState(filters.ageRange || []);
  const [country, setCountry] = useState(filters.country || '');
  const [nativeLanguage, setNativeLanguage] = useState(filters.nativeLanguage || '');
  const [learningLanguage, setLearningLanguage] = useState(filters.learningLanguage || '');
  const [onlineStatus, setOnlineStatus] = useState(filters.onlineStatus || 'all');


  const handleGenderChange = (e) => {
    setGender(e.target.value);
    onFilterChange({ ...filters, gender: e.target.value });
  };

  const handleAgeRangeChange = (range) => {
    setAgeRange(range);
    onFilterChange({ ...filters, ageRange: range });
  };

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
    onFilterChange({ ...filters, country: e.target.value });
  };

  const handleNativeLanguageChange = (e) => {
    setNativeLanguage(e.target.value);
    onFilterChange({ ...filters, nativeLanguage: e.target.value });
  };

  const handleLearningLanguageChange = (e) => {
    setLearningLanguage(e.target.value);
    onFilterChange({ ...filters, learningLanguage: e.target.value });
  };

  const handleOnlineStatusChange = (e) => {
    setOnlineStatus(e.target.value);
    onFilterChange({ ...filters, onlineStatus: e.target.value });
  };

  return (
    <div>
      <div>
        <label htmlFor="gender">Gender:</label>
        <select id="gender" value={gender} onChange={handleGenderChange}>
          <option value="">All</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="ageRange">Age Range:</label>
        {/* Add a custom range selection component here */}
        {/* Example using two input fields */}
        <input type="number" id="ageRangeMin" placeholder="Min Age" /> -
        <input type="number" id="ageRangeMax" placeholder="Max Age" />

      </div>

      <div>
        <label htmlFor="country">Country:</label>
        <select id="country" value={country} onChange={handleCountryChange}>
          <option value="">All</option>
          {countries.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="nativeLanguage">Native Language:</label>
        <select id="nativeLanguage" value={nativeLanguage} onChange={handleNativeLanguageChange}>
          <option value="">All</option>
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="learningLanguage">Learning Language:</label>
        <select id="learningLanguage" value={learningLanguage} onChange={handleLearningLanguageChange}>
          <option value="">All</option>
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="onlineStatus">Online Status:</label>
        <select id="onlineStatus" value={onlineStatus} onChange={handleOnlineStatusChange}>
          <option value="all">All Users</option>
          <option value="active">🟢 Active Now</option>
          <option value="recent">🟡 Recently Active</option>
        </select>
      </div>
    </div>
  );
};


const CommunityList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    gender: '',
    ageRange: [],
    country: '',
    nativeLanguage: '',
    learningLanguage: '',
    onlineStatus: 'all',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) return;

      let query = supabase
        .from('users')
        .select('id, username, profile_picture, is_online, last_active') //Added this line
        .neq('id', session.session.user.id)
        .order('last_active', { ascending: false });

      // Apply filters to the query
      if (filters.gender) query = query.eq('gender', filters.gender);
      if (filters.ageRange.length === 2) {
          query = query.gte('age', filters.ageRange[0]).lte('age', filters.ageRange[1]);
      }
      if (filters.country) query = query.eq('country', filters.country);
      if (filters.nativeLanguage) query = query.eq('native_language', filters.nativeLanguage);
      if (filters.learningLanguage) query = query.eq('learning_language', filters.learningLanguage);
      if (filters.onlineStatus === 'active') query = query.gt('last_active', new Date()); // Adjust logic for 'recently active' as needed
      if (filters.onlineStatus === 'recent') {
          query = query.gt('last_active', new Date(Date.now() - 86400000)); //Recently active within the last 24 hours
      }


      const { data, error } = await query;

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setUsers(data || []);
      setLoading(false);
    };

    fetchUsers();

    const subscription = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setUsers((prev) => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setUsers((prev) => prev.map((user) => (user.id === payload.new.id ? payload.new : user)));
        } else if (payload.eventType === 'DELETE') {
          setUsers((prev) => prev.filter((user) => user.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filters]);

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserClick = (userId: string) => {
    navigate(`/community/${userId}`);
  };

  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Our Community</h1>
          </div>
          <div className="flex gap-4 items-center">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="whitespace-nowrap"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="my-4">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              countries={COUNTRIES}
              languages={LANGUAGES}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading community members...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {filteredUsers.map((user) => (
              <UserPreviewCard
                key={user.id}
                user={user}
                onClick={() => handleUserClick(user.id)}
              />
            ))}
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No users found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityList;