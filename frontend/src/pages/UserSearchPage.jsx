import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { EmptyState } from '../components/ui/EmptyState';
import { 
  Search, 
  User, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Coins
} from 'lucide-react';

export const UserSearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0, hasMore: false });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const executeSearch = async (query, pageNum = 1) => {
    if (!query) {
      setResults([]);
      setPagination({ total: 0, page: 1, totalPages: 0, hasMore: false });
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(query)}&page=${pageNum}&limit=8`);
      setResults(res.data.users || []);
      setPagination(res.data.pagination);
    } catch (err) {
      setErrorMsg(err.message || 'Unable to complete search request.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(debouncedQuery, 1);
  }, [debouncedQuery]);

  const handlePageChange = (newPage) => {
    executeSearch(debouncedQuery, newPage);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Breadcrumbs items={[{ label: 'Find Friends' }]} />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Find Friends</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Find friends and roommates to track shared expenses and debts.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by name or @username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              className="text-base"
            />
          </div>
          {searchTerm && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setSearchTerm('');
                setResults([]);
              }}
            >
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Privacy Guaranteed: Contact numbers, emails, and balances remain private.</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-brand-danger text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results View */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs animate-pulse space-y-3">
              <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
              <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
              <div className="h-3 bg-slate-100 rounded-md w-1/2"></div>
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-500">
            Found {pagination.total} registered member{pagination.total === 1 ? '' : 's'}:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {results.map((member) => (
              <div
                key={member._id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-brand-primary/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-primary text-white font-bold text-base flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.fullName} className="w-full h-full object-cover" />
                      ) : (
                        member.fullName?.charAt(0) || 'U'
                      )}
                    </div>
                    <div className="truncate">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{member.fullName}</h3>
                      <p className="text-xs text-brand-primary font-mono truncate">@{member.username}</p>
                    </div>
                  </div>

                  {member.bio && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {member.bio}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Joined {new Date(member.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <Link to={`/users/${member.username}`} className="w-full">
                    <Button variant="outline" size="sm" fullWidthOnMobile className="w-full text-xs">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                icon={ChevronLeft}
              >
                Previous
              </Button>

              <span className="text-xs text-slate-500 font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <Button
                variant="secondary"
                size="sm"
                disabled={!pagination.hasMore}
                onClick={() => handlePageChange(pagination.page + 1)}
                icon={ChevronRight}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      ) : debouncedQuery ? (
        <EmptyState
          icon={Search}
          title="No friends found"
          description={`We couldn't find anyone matching "${debouncedQuery}". Please check the username or spelling and try again.`}
        />
      ) : (
        <EmptyState
          icon={Search}
          title="Search for Friends"
          description="Search by name or @username to view profiles and share expenses."
        />
      )}
    </div>
  );
};

