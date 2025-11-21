import React from 'react';
import { Building2, Edit2, Trash2, Globe, MapPin, Facebook, Star } from 'lucide-react';
import { Competitor } from '../../../../shared/store/services/competitorsApi';

interface CompetitorCardProps {
  competitor: Competitor;
  onEdit: (competitor: Competitor) => void;
  onDelete: (id: string) => void;
}

const CompetitorCard: React.FC<CompetitorCardProps> = ({ competitor, onEdit, onDelete }) => {
  const hasAnyUrl =
    competitor.website_url ||
    competitor.google_business_url ||
    competitor.facebook_url ||
    competitor.yelp_url;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 size={24} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {competitor.company_name}
            </h4>
            {competitor.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {competitor.notes}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-3">
          <button
            onClick={() => onEdit(competitor)}
            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
            title="Edit competitor"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(competitor.id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete competitor"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {hasAnyUrl && (
        <div className="space-y-2">
          {competitor.website_url && (
            <a
              href={competitor.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
            >
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                <Globe size={16} className="text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
              </div>
              <span className="truncate">{competitor.website_url}</span>
            </a>
          )}

          {competitor.google_business_url && (
            <a
              href={competitor.google_business_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
            >
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                <MapPin size={16} className="text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
              </div>
              <span className="truncate">Google Business Profile</span>
            </a>
          )}

          {competitor.facebook_url && (
            <a
              href={competitor.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
            >
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                <Facebook size={16} className="text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
              </div>
              <span className="truncate">Facebook Page</span>
            </a>
          )}

          {competitor.yelp_url && (
            <a
              href={competitor.yelp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
            >
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                <Star size={16} className="text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
              </div>
              <span className="truncate">Yelp Business Page</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default CompetitorCard;
