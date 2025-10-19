import { Crown, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "../../hooks/useSubscription";

interface SubscriptionBannerProps {
  currentCount: number;
  limitType: 'categories' | 'events';
}

export function SubscriptionBanner({ currentCount, limitType }: SubscriptionBannerProps) {
  const navigate = useNavigate();
  const { subscription, isAtLimit, isFree } = useSubscription();

  if (!subscription || !isFree) return null;

  const limit = limitType === 'categories'
    ? subscription.limits.maxCategories
    : subscription.limits.maxEvents;

  const isNearLimit = currentCount >= limit * 0.8;
  const atLimit = isAtLimit(currentCount, limitType);

  if (!isNearLimit) return null;

  return (
    <div
      className={`rounded-xl p-4 ${
        atLimit
          ? 'bg-gradient-to-r from-red-600 to-amber-500 text-white'
          : 'bg-gradient-to-r from-blue-900 to-teal-500 text-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            {atLimit ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <Crown className="w-5 h-5" />
            )}
            <h3 className="font-semibold">
              {atLimit
                ? `Limite atteinte : ${currentCount}/${limit} ${limitType === 'categories' ? 'catégories' : 'moments'}`
                : `Vous approchez de la limite : ${currentCount}/${limit} ${limitType === 'categories' ? 'catégories' : 'moments'}`}
            </h3>
          </div>
          <p className="text-sm opacity-90 mb-3">
            {atLimit
              ? `Vous avez atteint la limite du plan gratuit. Passez à Premium pour créer des ${limitType === 'categories' ? 'catégories' : 'moments'} illimités.`
              : `Encore ${limit - currentCount} ${limitType === 'categories' ? 'catégorie(s)' : 'moment(s)'} disponible(s). Passez à Premium pour ne plus avoir de limites.`}
          </p>
          <button
            onClick={() => navigate('/upgrade')}
            className="bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-opacity-90 transition-all inline-flex items-center space-x-2"
          >
            <Crown className="w-4 h-4" />
            <span>Passer à Premium</span>
          </button>
        </div>
      </div>
    </div>
  );
}
