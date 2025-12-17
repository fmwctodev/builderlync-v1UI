# TemplateBuilder Changes for Estimate Subsections

## 1. Add state for active subsection (around line 100)

After this line:
```typescript
const [activeSection, setActiveSection] = useState("Estimate");
```

Add:
```typescript
const [activeSubsection, setActiveSubsection] = useState("Demo");
```

## 2. Update subsection buttons to be clickable (around line 1050)

Replace:
```typescript
{section.subsections && (
  <div className="ml-4 space-y-1">
    {section.subsections.map((sub) => (
      <button
        key={sub}
        onClick={() => setActiveSection(section.name)}
        className="flex items-center justify-between p-2 rounded w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {sub}
        </span>
      </button>
    ))}
  </div>
)}
```

With:
```typescript
{section.subsections && (
  <div className="ml-4 space-y-1">
    {section.subsections.map((sub) => (
      <button
        key={sub}
        onClick={() => {
          setActiveSection(section.name);
          setActiveSubsection(sub);
        }}
        className={`flex items-center justify-between p-2 rounded w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
          activeSubsection === sub ? 'bg-gray-100 dark:bg-gray-700' : ''
        }`}
      >
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {sub}
        </span>
      </button>
    ))}
  </div>
)}
```

## 3. Wrap Estimate content and add Summary view (around line 1300)

Replace:
```typescript
{activeSection === "Estimate" && (
  <>
    <div className="mb-6">
```

With:
```typescript
{activeSection === "Estimate" && activeSubsection === "Demo" && (
  <>
    <div className="mb-6">
```

## 4. Add Summary subsection view (after the Estimate closing tag, before the next section)

After the closing `</>` of the Estimate section, add:

```typescript
{activeSection === "Estimate" && activeSubsection === "Summary" && (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{optionTitle}</h2>
    
    <div className="space-y-3">
      <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
        <span className="font-medium text-gray-900 dark:text-white">Estimate Total</span>
        <span className="font-medium text-gray-900 dark:text-white">${calculateEstimateSubtotal()}</span>
      </div>
      
      <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
        <span className="font-medium text-gray-900 dark:text-white">Upgrade Total</span>
        <span className="font-medium text-gray-900 dark:text-white">${calculateUpgradeSubtotal()}</span>
      </div>
      
      <div className="flex justify-between py-4 border-t-2 border-gray-900 dark:border-white mt-4">
        <span className="text-lg font-bold text-gray-900 dark:text-white">Overall Total</span>
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          ${(parseFloat(calculateEstimateSubtotal()) + parseFloat(calculateUpgradeSubtotal())).toFixed(2)}
        </span>
      </div>
    </div>

    <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
        By signing this document you agree to the statement of works provided by {companyName} and in accordance with any terms described within.
      </p>
    </div>
  </div>
)}
```

## Summary

These changes will:
1. Add a state to track which subsection (Demo/Summary) is active
2. Make subsection buttons clickable and highlight the active one
3. Show Demo content (existing items/upgrades) when Demo is selected
4. Show Summary content (totals + agreement text) when Summary is selected
5. Use the optionTitle as the heading in the Summary page
