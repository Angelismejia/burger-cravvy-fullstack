using BurgerCravvy.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BurgerCravvy.Infrastructure.Persistence.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> b)
    {
        b.ToTable("Empleados");
        b.HasKey(e => e.Id);
        b.HasIndex(e => e.Email).IsUnique();
        b.Property(e => e.Email).HasMaxLength(120).IsRequired();
        b.Property(e => e.FullName).HasMaxLength(80).IsRequired();
        b.Property(e => e.PasswordHash).HasMaxLength(200).IsRequired();
        b.Property(e => e.Role).HasConversion<string>().HasMaxLength(20);
    }
}
