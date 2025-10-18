interface EventCardProps {
  id: string;
  title: string;
  date: Date;
  category: string;
  color: string;
  onClick?: () => void;
}

export const EventCard = ({
  title,
  date,
  category,
  color,
  onClick,
}: EventCardProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
    >
      <div className="flex items-center space-x-4">
        <div className="w-2 h-2 bg-gray-900 rounded-full" />
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{formatDate(date)}</p>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
        {category}
      </span>
    </div>
  );
};
