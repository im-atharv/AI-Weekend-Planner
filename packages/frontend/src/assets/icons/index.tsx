import React from "react";

type IconProps = {
    className?: string;
};

export const SparklesIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
    </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg
        xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
            strokeLinecap="round"
strokeLinejoin = "round"
d = "M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 10.5M20 20l-1.5-1.5A9 9 0 003.5 13.5"
    />
    </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({
    className = "w-5 h-5",
}) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M13 7l5 5m0 0l-5 5m5-5H6"
    />
    </svg>
);

export const BackIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M11 17l-5-5m0 0l5-5m-5 5h12"
    />
    </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({
    className = "w-6 h-6",
}) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
    </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
    </svg>
);

export const LocationIcon: React.FC<IconProps> = ({
    className = "w-5 h-5",
}) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
    </svg>
);

export const TagIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zm0 0v11a2 2 0 002 2h5a2 2 0 002-2V5a2 2 0 00-2-2H7z"
    />
    </svg>
);

export const TicketIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
    />
    </svg>
);

export const EditIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
    />
    </svg>
);

export const SendIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
viewBox = "0 0 24 24"
fill = "currentColor"
    >
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
);

export const CarIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
    />
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M13 17H6v-2h7v2zM19 17h-2v-2h2v2zM5 15V7a2 2 0 012-2h10a2 2 0 012 2v8"
    />
    <path strokeLinecap="round" strokeLinejoin = "round" d = "M19 7l-4 4H9" />
        </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
    </svg>
);

export const SaveIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    />
    </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
    </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
    </svg>
);

export const PlansIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
    </svg>
);

export const RupeeIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M9 8h6m-5 4h5m2 0c1.105 0 2 .895 2 2s-.895 2-2 2H8c-1.105 0-2-.895-2-2s.895-2 2-2h8m-7 0a2 2 0 00-2 2v0a2 2 0 002 2h0"
    />
    </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({
    className = "w-6 h-6",
}) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
    </svg>
);

export const ExclamationCircleIcon: React.FC<IconProps> = ({
    className = "w-6 h-6",
}) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path
      strokeLinecap="round"
strokeLinejoin = "round"
d = "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
    </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg
    xmlns= "http://www.w3.org/2000/svg"
className = { className }
fill = "none"
viewBox = "0 0 24 24"
stroke = "currentColor"
strokeWidth = { 2}
    >
    <path strokeLinecap="round" strokeLinejoin = "round" d = "M6 18L18 6M6 6l12 12" />
        </svg>
);