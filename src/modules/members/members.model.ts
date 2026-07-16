import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { GENDERS } from 'src/modules/members/members.constants';

@Table({ tableName: 'members' })
export class Member extends Model<Member> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  firstName: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  lastName: string;

  // Business rule: gender is male or female only. Enforced at the model layer
  // (runs on create/update) in addition to the DTO validation.
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: { isIn: [[...GENDERS]] },
  })
  gender: string;

  @Column({ type: DataType.STRING, allowNull: false })
  dateOfBirth: string;

  // Nullable at the DB level so adding this column to an already-populated
  // table is a safe migration; the create DTO enforces it as required for new
  // members.
  @Column({ type: DataType.STRING, allowNull: true })
  subscriptionDate?: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  phone?: string;

  // Self-referencing link to a central member. Nullable: a member need not have
  // a central member.
  @ForeignKey(() => Member)
  @Column({ type: DataType.UUID, allowNull: true })
  centralMemberId?: string;

  // The central member this member is linked to.
  @BelongsTo(() => Member, 'centralMemberId')
  centralMember?: Member;

  // The members linked to this member as their central member (its family
  // members). Reverse side of the self-reference.
  @HasMany(() => Member, 'centralMemberId')
  familyMembers?: Member[];
}
