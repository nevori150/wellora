export function calcPricePerUnit(
  price: number,
  sizeValue?: number,
  sizeUnit?: string
): string | null {
  if (!sizeValue || !sizeUnit || sizeValue <= 1) return null;
  if (sizeUnit === 'מ"ל' || sizeUnit === 'גרם') {
    return `₪${(price / sizeValue * 100).toFixed(1)} ל-100${sizeUnit}`;
  }
  if (sizeUnit === 'קפסולות') {
    return `₪${(price / sizeValue).toFixed(2)} לקפסולה`;
  }
  if (sizeUnit === "יח'" && sizeValue > 1) {
    return `₪${(price / sizeValue).toFixed(0)} ליחידה`;
  }
  return null;
}

export function calcPricePerUnitNumeric(
  price: number,
  sizeValue?: number,
  sizeUnit?: string
): number | null {
  if (!sizeValue || !sizeUnit || sizeValue <= 1) return null;
  if (sizeUnit === 'מ"ל' || sizeUnit === 'גרם') return (price / sizeValue) * 100;
  if (sizeUnit === 'קפסולות') return price / sizeValue;
  if (sizeUnit === "יח'" && sizeValue > 1) return price / sizeValue;
  return null;
}
