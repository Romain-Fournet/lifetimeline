interface MemoryCardProps {
  year: number;
  title: string;
  description: string;
  gradient: string;
  onClick?: () => void;
}

export const MemoryCard = ({
  year,
  title,
  description,
  gradient,
  onClick,
}: MemoryCardProps) => {
  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div
        className={`${gradient} h-32 rounded-lg mb-3 flex items-center justify-center text-white text-2xl font-bold group-hover:scale-105 transition-transform`}
      >
        {year}
      </div>
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};
