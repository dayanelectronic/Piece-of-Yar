export type ComponentCategory =
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'diode'
  | 'transistor'
  | 'voltage_regulator'
  | 'opamp_analog'
  | 'digital_ic'
  | 'mcu'
  | 'sensor_module'
  | 'connector'
  | 'relay_switch'
  | 'crystal'
  | 'optocoupler'
  | 'power_battery'
  | 'other';

export interface ComponentPin {
  num: number;
  name: string;
  desc: string;
}

export interface ComponentPinout {
  pinCount: number;
  pins: ComponentPin[];
}

export interface ComponentLocation {
  box: string;
  drawer: string;
  bin: string;
}

export interface Component {
  id: string;
  mpn: string; // Manufacturer Part Number
  name: string; // Persian descriptive name
  category: ComponentCategory;
  subcategory?: string;
  package: string; // DIP-8, SMD 0805, TO-220, SOT-23, etc.
  mountingType: 'smd' | 'through_hole';
  quantity: number;
  minStock: number;
  unit: string;
  location: ComponentLocation;
  specs: Record<string, string>;
  pinout?: ComponentPinout;
  manufacturer: string;
  unitPrice: number; // in Tomans
  datasheetUrl?: string;
  tags: string[];
  equivalents: string[];
  notes?: string;
  updatedAt: string;
}

export type TransactionType = 'in' | 'out' | 'adjust';

export interface StockTransaction {
  id: string;
  componentId: string;
  componentMpn: string;
  componentName: string;
  type: TransactionType;
  quantity: number;
  balanceAfter: number;
  reason: string;
  projectName?: string;
  date: string;
}

export interface BOMItem {
  componentId: string;
  quantityPerUnit: number;
  notes?: string;
}

export interface ProjectBOM {
  id: string;
  name: string;
  description: string;
  batchSize: number;
  items: BOMItem[];
  createdAt: string;
  status: 'draft' | 'in_progress' | 'completed';
}

export interface SmartSearchResult {
  queryAnalysis: string;
  technicalSpecsExtracted?: Record<string, any>;
  matchedComponentIds: string[];
  matchExplanations?: Record<string, string>;
  equivalentSuggestions?: {
    mpn: string;
    description: string;
    advantage?: string;
  }[];
  recommendationsText: string;
}

export interface CategoryMeta {
  id: ComponentCategory;
  label: string;
  iconName: string;
  defaultSpecs: string[];
}
