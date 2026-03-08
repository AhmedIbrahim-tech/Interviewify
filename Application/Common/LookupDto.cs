namespace Application.Common;

public class LookupDto
{
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;

    public LookupDto() { }

    public LookupDto(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public LookupDto(int value, string label)
    {
        Value = value.ToString();
        Label = label;
    }
}
