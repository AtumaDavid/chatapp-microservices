import { sequelize } from '@/DB/sequelize';
import { DataTypes, Model, type Optional } from 'sequelize';
import { UserCredentials } from './user-credentials.model';

export interface RefreshTokenAttributes {
  id: string;
  userId: number;
  tokenId: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type RefreshTokenCreationAttributes = Optional<
  RefreshTokenAttributes,
  'id' | 'createdAt' | 'updatedAt'
>;

export class RefreshToken
  extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>
  implements RefreshTokenAttributes
{
  declare id: string;
  declare userId: number;
  declare tokenId: string;
  declare expiresAt: Date;
  declare createdAt: Date;
  declare updatedAt: Date;
}

RefreshToken.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      //   references: {
      //     model: UserCredentials,
      //     key: 'id',
      //   },
      //   onDelete: 'CASCADE',
    },
    tokenId: {
      type: DataTypes.UUID,
      allowNull: false,
      //   unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'refresh_tokens',
  },
);

UserCredentials.hasMany(RefreshToken, {
  foreignKey: 'userId',
  as: 'refreshTokens',
  onDelete: 'CASCADE',
});
RefreshToken.belongsTo(UserCredentials, { foreignKey: 'userId', as: 'user' });
