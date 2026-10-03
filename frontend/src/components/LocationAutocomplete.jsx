import React, { useState, useRef, useEffect } from 'react'
import { MapPin } from 'lucide-react'

const INDIAN_LOCATIONS = [
    'Ahmedabad, Gujarat',
    'Gandhinagar, Gujarat',
    'GIFT City, Gandhinagar, Gujarat',
    'Bengaluru, Karnataka',
    'Hyderabad, Telangana',
    'Pune, Maharashtra',
    'Mumbai, Maharashtra',
    'Gurugram, Haryana',
    'Noida, Uttar Pradesh',
    'Chennai, Tamil Nadu',
    'Delhi, India',
    'Remote – India',
]

export default function LocationAutocomplete({ value, onChange, disabled, placeholder = 'e.g. Ahmedabad, Gujarat' }) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef(null)

    const filteredLocations = INDIAN_LOCATIONS.filter(loc =>
        loc.toLowerCase().includes((value || '').toLowerCase())
    )

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                <input
                    id="location"
                    name="location"
                    type="text"
                    placeholder={placeholder}
                    className="input-field pl-9 w-full"
                    value={value || ''}
                    onChange={(e) => {
                        onChange(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                    disabled={disabled}
                    autoComplete="off"
                />
            </div>

            {isOpen && filteredLocations.length > 0 && (
                <ul className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg text-xs py-1">
                    {filteredLocations.map((loc) => (
                        <li
                            key={loc}
                            onClick={() => {
                                onChange(loc)
                                setIsOpen(false)
                            }}
                            className="px-3 py-2 hover:bg-[var(--card-hover)] cursor-pointer flex items-center gap-2 text-[var(--text)] transition-colors"
                        >
                            <MapPin size={12} className="text-[var(--primary)] shrink-0" />
                            <span>{loc}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
