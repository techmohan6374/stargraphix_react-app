import { useState, useEffect, useRef } from 'react';
import Icon from '../icons/Icons';

export const DEFAULT_SERVICE_OPTIONS = [
  {
    category: 'Featured Brands & Clients',
    items: [
      { label: 'Aadhira Books', value: 'Aadhira Books', desc: 'Publishing & Book Printing' },
      { label: 'SSA Invoice', value: 'SSA Invoice', desc: 'Billing & Invoice Solutions' },
      { label: 'Salem Bakery', value: 'Salem Bakery', desc: 'Branding & Packaging' },
      { label: 'Salem Agri Farm', value: 'Salem Agri Farm', desc: 'Web App & Marketing' },
      { label: 'Apex Tech Solutions', value: 'Apex Tech Solutions', desc: 'Branding & Tech' },
      { label: 'RideSalem', value: 'RideSalem', desc: 'Mobile App & Design' },
      { label: 'Grand Furnishings', value: 'Grand Furnishings', desc: 'Catalog & Web App' },
      { label: 'Priya Sweets', value: 'Priya Sweets', desc: 'Box Printing & Design' },
      { label: 'Nova Clinic', value: 'Nova Clinic', desc: 'Healthcare Software & Branding' },
      { label: 'StyleHub', value: 'StyleHub', desc: 'Fashion E-Commerce & Prints' },
    ],
  },
  {
    category: 'Design & Printing Services',
    items: [
      { label: 'Flyers Design', value: 'Flyers Design', desc: 'Promotional & Marketing Flyers' },
      { label: 'Business Cards', value: 'Business Cards', desc: 'Premium & Gold Foil Cards' },
      { label: 'Resume Design', value: 'Resume Design', desc: 'ATS-Friendly Modern Resumes' },
      { label: 'Instagram Posts', value: 'Instagram Posts', desc: 'Social Media Templates' },
      { label: 'Wedding Cards', value: 'Wedding Cards', desc: 'Royal & Traditional Invitations' },
      { label: 'Logo Design', value: 'Logo Design', desc: 'Brand Identity & Vector Logos' },
      { label: 'Brochure Design', value: 'Brochure Design', desc: 'Bi-fold & Tri-fold Brochures' },
    ],
  },
  {
    category: 'Software & Digital Solutions',
    items: [
      { label: 'Web Development', value: 'Web Development', desc: 'Full-Stack Web Applications' },
      { label: 'Mobile App Development', value: 'Mobile App Development', desc: 'iOS & Android Mobile Apps' },
      { label: 'E-Commerce Store', value: 'E-Commerce Store', desc: 'Online Shopping Websites' },
      { label: 'Other', value: 'Other', desc: 'Custom Project Inquiry' },
    ],
  },
];

export default function SearchableSelect({
  value,
  onChange,
  placeholder = 'Select a service...',
  optionsGroups = DEFAULT_SERVICE_OPTIONS,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Flatten options to easily find selected item label
  const allItems = optionsGroups.flatMap((group) => group.items);
  const selectedItem = allItems.find((item) => item.value === value || item.label === value);

  // Filter options by search term
  const filteredGroups = optionsGroups
    .map((group) => {
      const filteredItems = group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.desc && item.desc.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      return { ...group, items: filteredItems };
    })
    .filter((group) => group.items.length > 0);

  const handleSelect = (itemValue) => {
    onChange(itemValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Trigger Button / Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`input-field flex items-center justify-between cursor-pointer transition-all duration-200 ${
          isOpen ? 'ring-2 ring-primary-500 border-primary-500 bg-white' : 'hover:border-gray-400 bg-white'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {selectedItem ? (
            <span className="font-semibold text-gray-900 truncate text-sm">
              {selectedItem.label}
            </span>
          ) : (
            <span className="text-gray-400 text-sm truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 text-gray-400">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
              title="Clear selection"
            >
              <Icon name="X" size={14} />
            </button>
          )}
          <Icon
            name="ChevronDown"
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-600' : ''}`}
          />
        </div>
      </div>

      {/* Floating Dropdown Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-fade-in max-h-80 flex flex-col">
          {/* Search Bar inside Dropdown */}
          <div className="p-2.5 bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
            <div className="relative">
              <Icon
                name="Search"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search service or business (e.g. Aadhira Books, SSA Invoice)..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 text-gray-800 placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Icon name="X" size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto p-1.5 space-y-3 flex-1 scrollbar-thin">
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div key={group.category}>
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50/70 rounded-md mb-1">
                    {group.category}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isSelected = value === item.value || value === item.label;
                      return (
                        <div
                          key={item.value}
                          onClick={() => handleSelect(item.value)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-all duration-150 ${
                            isSelected
                              ? 'bg-primary-600 text-white font-semibold shadow-sm'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="truncate text-xs sm:text-sm font-medium">{item.label}</p>
                            {item.desc && (
                              <p
                                className={`text-[11px] truncate ${
                                  isSelected ? 'text-red-100' : 'text-gray-400'
                                }`}
                              >
                                {item.desc}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <Icon name="Check" size={16} className="text-white flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center px-4">
                <Icon name="Search" size={24} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-semibold text-gray-500">No services or businesses found</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Try searching with a different keyword</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
