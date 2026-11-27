using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Accounting.BackOffice.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveClientFeeAmountCheckConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_ClientFees_MonthlyAmount_Positive",
                table: "ClientFees");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "CK_ClientFees_MonthlyAmount_Positive",
                table: "ClientFees",
                sql: "\"MonthlyAmount\" > 0");
        }
    }
}
