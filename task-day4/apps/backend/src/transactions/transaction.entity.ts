import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'transactions' })
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 66 })
  txHash: string; // 0x + 64 hex

  @Column({ type: 'varchar', length: 42, nullable: true })
  from: string | null;

  @Column({ type: 'varchar', length: 42, nullable: true })
  to: string | null;

  @Column({ type: 'numeric', precision: 78, scale: 0, nullable: true })
  value: string | null; // store as string to preserve precision

  @Column({ type: 'integer', nullable: true })
  blockNumber: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
