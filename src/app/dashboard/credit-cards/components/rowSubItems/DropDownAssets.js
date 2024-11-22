'use client';

import AutocompleteGroup from 'src/components/form-inputs/AutocompleteGroup';

import { assetItems } from 'src/assets/data/assets';
import { useFormContext } from 'react-hook-form';
import { useRecalculateByUnit } from '../utils/useRecalculateByUnit';

export default function DropDownAssets({ baseFieldName, allocationIndex }) {
  const { setValue, getValues } = useFormContext();
  const recalculateByUnit = useRecalculateByUnit();

  const handleChange = (newValue) => {
    const calculationMethod = getValues(`calculationMethod`);

    if (calculationMethod === 'unit') {
      const { units = 0 } = newValue || {};

      const transaction = getValues();
      const updatedAllocations = transaction.allocations.map((allocation, index) =>
        index === allocationIndex ? { ...allocation, asset: newValue } : allocation
      );
      recalculateByUnit(updatedAllocations, transaction.amount);
      setValue(`${baseFieldName}.helper`, units);
    }
  };

  const fieldName = `${baseFieldName}.asset`;
  return (
    <AutocompleteGroup
      fieldName={fieldName}
      options={assetItems}
      handleChange={handleChange}
      label="Location"
      id="grouped-asset-accounts"
    />
  );
}
