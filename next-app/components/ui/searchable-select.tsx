"use client";

import { useState, useRef, useEffect, useMemo } from "react";

export interface SearchableSelectOption {
  value: string;
  label: string;
  avatar?: string; // Optional avatar URL for members
  subtitle?: string; // Optional subtitle for additional info
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  isDark?: boolean;
  showAvatars?: boolean;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  disabled = false,
  className = "",
  style = {},
  isDark = false,
  showAvatars = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const lowerSearch = searchTerm.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(lowerSearch) ||
        option.subtitle?.toLowerCase().includes(lowerSearch)
    );
  }, [options, searchTerm]);

  // Get the selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
          setSearchTerm("");
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        break;
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const baseStyles = {
    container: {
      position: "relative" as const,
      width: "100%",
      ...style,
    },
    trigger: {
      width: "100%",
      padding: "0.5rem 1rem",
      borderRadius: "6px",
      border: isDark
        ? "1px solid rgba(255,255,255,0.2)"
        : "1px solid rgba(0,0,0,0.2)",
      background: isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.9)",
      color: isDark ? "#fff" : "#000",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      textAlign: "left" as const,
    },
    dropdown: {
      position: "absolute" as const,
      top: "calc(100% + 4px)",
      left: 0,
      right: 0,
      maxHeight: "300px",
      overflowY: "auto" as const,
      border: isDark
        ? "1px solid rgba(255,255,255,0.2)"
        : "1px solid rgba(0,0,0,0.2)",
      borderRadius: "6px",
      background: isDark ? "rgba(20,20,20,0.98)" : "rgba(255,255,255,0.98)",
      boxShadow: isDark
        ? "0 10px 40px rgba(0,0,0,0.5)"
        : "0 10px 40px rgba(0,0,0,0.15)",
      zIndex: 1000,
      backdropFilter: "blur(10px)",
    },
    searchInput: {
      width: "100%",
      padding: "0.75rem 1rem",
      border: "none",
      borderBottom: isDark
        ? "1px solid rgba(255,255,255,0.1)"
        : "1px solid rgba(0,0,0,0.1)",
      background: "transparent",
      color: isDark ? "#fff" : "#000",
      outline: "none",
      fontSize: "0.95rem",
    },
    option: {
      padding: "0.75rem 1rem",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      transition: "background 0.15s",
    },
    optionHighlighted: {
      background: isDark ? "rgba(88,101,242,0.3)" : "rgba(88,101,242,0.15)",
    },
    optionSelected: {
      background: isDark ? "rgba(88,101,242,0.2)" : "rgba(88,101,242,0.1)",
      fontWeight: "600" as const,
    },
    avatar: {
      width: "28px",
      height: "28px",
      borderRadius: "50%",
      flexShrink: 0,
    },
    optionText: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "0.15rem",
      flex: 1,
    },
    optionLabel: {
      fontSize: "0.95rem",
    },
    optionSubtitle: {
      fontSize: "0.75rem",
      opacity: 0.6,
    },
    noResults: {
      padding: "1rem",
      textAlign: "center" as const,
      opacity: 0.6,
      fontSize: "0.875rem",
    },
    arrow: {
      transition: "transform 0.2s",
      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
    },
  };

  return (
    <div ref={containerRef} style={baseStyles.container} className={className}>
      {/* Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        style={baseStyles.trigger}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
          {displayValue}
        </span>
        <span style={baseStyles.arrow}>▼</span>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div style={baseStyles.dropdown}>
          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type to search..."
            style={baseStyles.searchInput}
          />

          {/* Options List */}
          <div ref={listRef} role="listbox">
            {filteredOptions.length === 0 ? (
              <div style={baseStyles.noResults}>No results found</div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={option.value}
                    onClick={() => handleOptionClick(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    style={{
                      ...baseStyles.option,
                      ...(isHighlighted && baseStyles.optionHighlighted),
                      ...(isSelected && baseStyles.optionSelected),
                    }}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {showAvatars && option.avatar && (
                      <img
                        src={option.avatar}
                        alt={option.label}
                        style={baseStyles.avatar}
                      />
                    )}
                    <div style={baseStyles.optionText}>
                      <div style={baseStyles.optionLabel}>{option.label}</div>
                      {option.subtitle && (
                        <div style={baseStyles.optionSubtitle}>
                          {option.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
