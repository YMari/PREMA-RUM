using System.ComponentModel.DataAnnotations;

namespace PreEnrollmentMgmt.WebApi.Controllers.DTOS.Requests;

public class ChangeDepartmentRequest
{
    [Required] public int DepartmentId { get; set; }
}