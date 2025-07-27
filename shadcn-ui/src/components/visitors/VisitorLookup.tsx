import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserRoundSearch, UserRoundCheck, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Visitor } from '@/lib/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ApiService } from '@/lib/api/api-service';

interface VisitorLookupProps {
  onSelect: (visitor: Partial<Visitor>) => void;
  onCancel: () => void;
}

export function VisitorLookup({ onSelect, onCancel }: VisitorLookupProps) {
  const [email, setEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Visitor[]>([]);
  const visitors = useAppStore(state => state.visitors);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setIsSearching(true);
    setError(null);
    
    try {
      // Call API to search for visitor by email
      const response = await ApiService.findVisitorByEmail(email);
      
      if (response.data && response.data.visitors) {
        // Sort by most recent
        const apiResults = response.data.visitors.sort((a: Visitor, b: Visitor) => {
          const dateA = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
          const dateB = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
          return dateB - dateA;
        });
        
        setSearchResults(apiResults);
        
        if (apiResults.length === 0) {
          setError('No previous visits found with this email address');
        }
      } else {
        // Fallback to local search if API doesn't return expected data
        const matches = visitors.filter(
          visitor => visitor.email.toLowerCase() === email.toLowerCase()
        );
        
        // Sort by most recent
        matches.sort((a, b) => {
          const dateA = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
          const dateB = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
          return dateB - dateA;
        });
        
        setSearchResults(matches);
        
        if (matches.length === 0) {
          setError('No previous visits found with this email address');
        }
      }
    } catch (error: unknown) {
      console.error('Search error:', error);
      const err = error as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || 'An error occurred while searching');
      
      // Fallback to local search if API fails
      const matches = visitors.filter(
        visitor => visitor.email.toLowerCase() === email.toLowerCase()
      );
      
      matches.sort((a, b) => {
        const dateA = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
        const dateB = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
        return dateB - dateA;
      });
      
      setSearchResults(matches);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Select a visitor from the results to pre-fill the form
  const handleSelectVisitor = (visitor: Visitor) => {
    try {
      // Create a copy without ID, check-in times, and status
      const visitorDataForForm: Partial<Visitor> = {
        name: visitor.name || '',
        email: visitor.email || '',
        phone: visitor.phone || '',
        company: visitor.company || '',
        photoUrl: visitor.photoUrl || '',
        hostId: visitor.hostId || '',
        purpose: visitor.purpose || '',
        customFields: visitor.customFields || {}
      };
      
      // Ensure all required fields are present before passing to parent component
      onSelect(visitorDataForForm);
    } catch (error) {
      console.error('Error selecting visitor:', error);
      setError('Error selecting visitor information. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Find Returning Visitor</CardTitle>
        <CardDescription>
          Enter the visitor's email to retrieve their information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Email address"
              type="email"
              className="pl-8"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !email}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserRoundSearch className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {error && (
          <Alert className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-medium">Previous Visits:</h3>
            {searchResults.map(visitor => (
              <Card key={visitor.id} className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{visitor.name}</p>
                    <p className="text-xs text-muted-foreground">{visitor.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Last visit: {visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleSelectVisitor(visitor)}
                    variant="secondary"
                  >
                    <UserRoundCheck className="h-4 w-4 mr-1" />
                    Use
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </CardFooter>
    </Card>
  );
}