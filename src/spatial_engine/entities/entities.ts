import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany, ManyToOne } from 'typeorm';
import { Geometry } from 'geojson';

@Entity('intersections')
export class Intersection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  @Index({ spatial: true })
  centerNode: Geometry;

  @OneToMany(() => Lane, (lane) => lane.intersection)
  lanes: Lane[];
}

@Entity('lanes')
export class Lane {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  laneNumber: number;

  @Column()
  isIncoming: boolean;

  @ManyToOne(() => Intersection, (intersection) => intersection.lanes)
  intersection: Intersection;

  @Column()
  intersectionId: number;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'LineString',
    srid: 4326,
  })
  @Index({ spatial: true })
  geometry: Geometry;
}