﻿// <auto-generated />
using System;
using FightTimeLine.DataLayer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace FightTimeLine.Migrations
{
    [DbContext(typeof(FightTimelineDataContext))]
    [Migration("20190811124415_SessionsLastTouched")]
    partial class SessionsLastTouched
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.1.11-servicing-32099")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("FightTimeLine.DataLayer.BossEntity", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTimeOffset?>("CreateDate");

                    b.Property<string>("Data");

                    b.Property<Guid>("Identifier");

                    b.Property<bool>("IsPrivate");

                    b.Property<DateTimeOffset?>("ModifiedDate");

                    b.Property<string>("Name");

                    b.Property<long?>("Reference");

                    b.Property<string>("UserName");

                    b.HasKey("Id");

                    b.ToTable("Bosses");
                });

            modelBuilder.Entity("FightTimeLine.DataLayer.CommandEntity", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Body");

                    b.Property<DateTimeOffset>("DateCreated");

                    b.Property<Guid>("Fight");

                    b.Property<string>("UserName");

                    b.HasKey("Id");

                    b.ToTable("Commands");
                });

            modelBuilder.Entity("FightTimeLine.DataLayer.FightEntity", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<DateTimeOffset?>("CreateDate");

                    b.Property<string>("Data");

                    b.Property<Guid>("Identifier");

                    b.Property<bool?>("IsDraft");

                    b.Property<DateTimeOffset?>("ModifiedDate");

                    b.Property<string>("Name");

                    b.Property<string>("UserName");

                    b.HasKey("Id");

                    b.ToTable("Fights");
                });

            modelBuilder.Entity("FightTimeLine.DataLayer.SessionEntity", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<Guid>("Fight");

                    b.Property<DateTimeOffset?>("LastTouched");

                    b.Property<string>("UserId");

                    b.Property<string>("UserName");

                    b.HasKey("Id");

                    b.ToTable("Sessions");
                });

            modelBuilder.Entity("FightTimeLine.DataLayer.UserEntity", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Name");

                    b.Property<string>("Password");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });
#pragma warning restore 612, 618
        }
    }
}
