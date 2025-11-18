import React from "react";
import Link from "next/link";

const menus = [
  { label: "Overview", href: "#overview" },
  { label: "Accommodation", href: "#accommodation" },
  { label: "Travellers", href: "#travellers" },
  { label: "Itinerary", href: "#itinerary" },
  { label: "Budget", href: "#budget" },
  { label: "Map", href: "#map" },
];

const TripPlanNavBar = () => {
  return (
    <nav className="flex items-center gap-2 h-14">
      {menus.map((menu) => (
        <Link
          key={menu.label}
          href={menu.href}
          className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded transition-colors font-medium"
        >
          {menu.label}
        </Link>
      ))}
    </nav>
  );
};

export default TripPlanNavBar;
