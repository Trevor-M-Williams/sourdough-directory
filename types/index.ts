export type CollectionField = {
  id: string;
  isEditable?: boolean;
  isRequired: boolean;
  type: string;
  slug?: string;
  displayName?: string;
  validations?: {
    options:
      | {
          name: string;
          id: string;
        }[];
  };
};

export type Collection = {
  id: string;
  fields: CollectionField[];
  displayName?: string;
  singularName?: string;
  slug?: string;
  createdOn?: Date;
  lastUpdated?: Date;
};
