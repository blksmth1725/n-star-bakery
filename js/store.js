const PREORDER_STORAGE_KEY = "NStarPreorder";
const MAX_QTY = 50;

const PRODUCTS = [
  {
    id: "country-sourdough",
    name: "Country Sourdough",
    unit: "loaf",
    priceLow: 6,
    priceHigh: 8,
  },
  {
    id: "seeded-whole-wheat",
    name: "Seeded Whole Wheat",
    unit: "loaf",
    priceLow: 6,
    priceHigh: 8,
  },
  {
    id: "signature-loaf",
    name: "Signature Loaf",
    unit: "loaf",
    priceLow: 7,
    priceHigh: 9,
  },
  {
    id: "croissant",
    name: "Croissant",
    unit: "each",
    priceLow: 3,
    priceHigh: 4.5,
  },
  {
    id: "sandwich-cookie",
    name: "Sandwich Cookie",
    unit: "each",
    priceLow: 3,
    priceHigh: 4,
  },
  {
    id: "celebration-cake",
    name: "Celebration Cake",
    unit: "cake",
    priceLow: 40,
    priceHigh: 120,
  },
  {
    id: "cupcakes",
    name: "Cupcakes",
    unit: "dozen",
    priceLow: 30,
    priceHigh: 42,
  },
];

const findProduct = (id) => {
  return PRODUCTS.find((product) => product.id === id) || null;
};

const formatMoney = (amount) => {
  return "$" + (Number.isInteger(amount) ? String(amount) : amount.toFixed(2));
};

const formatItemLabel = (item) => {
  const product = findProduct(item.id);
  const unitWord = product.unit === "dozen" ? "dozen" : "x";
  return `${item.qty} ${unitWord} ${product.name}`;
};

const loadPreorder = () => {
  try {
    const raw = localStorage.getItem(PREORDER_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        findProduct(item.id) !== null &&
        Number.isInteger(item.qty) &&
        item.qty >= 1 &&
        item.qty <= MAX_QTY
    );
  } catch (error) {
    return [];
  }
};

const savePreorder = (list) => {
  try {
    localStorage.setItem(PREORDER_STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (error) {
    return false;
  }
};

const estimateTotal = (list) => {
  return list.reduce(
    (totals, item) => {
      const product = findProduct(item.id);
      totals.low += product.priceLow * item.qty;
      totals.high += product.priceHigh * item.qty;
      return totals;
    },
    { low: 0, high: 0 }
  );
};
