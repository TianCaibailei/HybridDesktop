namespace HybridApp.WinForms;

partial class Form1
{
    /// <summary>
    ///  Required designer variable.
    /// </summary>
    private System.ComponentModel.IContainer components = null;

    /// <summary>
    ///  Clean up any resources being used.
    /// </summary>
    /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
    protected override void Dispose(bool disposing)
    {
        if (disposing && (components != null))
        {
            components.Dispose();
        }
        base.Dispose(disposing);
    }

    #region Windows Form Designer generated code

    /// <summary>
    ///  Required method for Designer support - do not modify
    ///  the contents of this method with the code editor.
    /// </summary>
    private void InitializeComponent()
    {
        components = new System.ComponentModel.Container();
        panel1 = new Panel();
        listBoxLogs = new ListBox();
        btnAddLog = new Button();
        numericUpDownResX = new NumericUpDown();
        labelResX = new Label();
        textBoxModelName = new TextBox();
        labelModel = new Label();
        checkBoxIsRunning = new CheckBox();
        numericUpDownGain = new NumericUpDown();
        labelGain = new Label();
        label1 = new Label();
        trackBarExposure = new TrackBar();
        webView = new Microsoft.Web.WebView2.WinForms.WebView2();
        timer1 = new System.Windows.Forms.Timer(components);
        panel1.SuspendLayout();
        ((System.ComponentModel.ISupportInitialize)numericUpDownResX).BeginInit();
        ((System.ComponentModel.ISupportInitialize)numericUpDownGain).BeginInit();
        ((System.ComponentModel.ISupportInitialize)trackBarExposure).BeginInit();
        ((System.ComponentModel.ISupportInitialize)webView).BeginInit();
        SuspendLayout();
        // 
        // panel1
        // 
        panel1.Controls.Add(listBoxLogs);
        panel1.Controls.Add(btnAddLog);
        panel1.Controls.Add(numericUpDownResX);
        panel1.Controls.Add(labelResX);
        panel1.Controls.Add(textBoxModelName);
        panel1.Controls.Add(labelModel);
        panel1.Controls.Add(checkBoxIsRunning);
        panel1.Controls.Add(numericUpDownGain);
        panel1.Controls.Add(labelGain);
        panel1.Controls.Add(label1);
        panel1.Controls.Add(trackBarExposure);
        panel1.Dock = DockStyle.Right;
        panel1.Location = new Point(500, 0);
        panel1.Name = "panel1";
        panel1.Size = new Size(300, 450);
        panel1.TabIndex = 1;
        // 
        // listBoxLogs
        // 
        listBoxLogs.FormattingEnabled = true;
        listBoxLogs.ItemHeight = 17;
        listBoxLogs.Location = new Point(10, 227);
        listBoxLogs.Name = "listBoxLogs";
        listBoxLogs.Size = new Size(280, 208);
        listBoxLogs.TabIndex = 4;
        // 
        // btnAddLog
        // 
        btnAddLog.Location = new Point(10, 191);
        btnAddLog.Name = "btnAddLog";
        btnAddLog.Size = new Size(280, 30);
        btnAddLog.TabIndex = 3;
        btnAddLog.Text = "添加日志 (WinForm)";
        btnAddLog.UseVisualStyleBackColor = true;
        btnAddLog.Click += btnAddLog_Click;
        // 
        // numericUpDownResX
        // 
        numericUpDownResX.Location = new Point(94, 148);
        numericUpDownResX.Maximum = new decimal(new int[] { 10000, 0, 0, 0 });
        numericUpDownResX.Name = "numericUpDownResX";
        numericUpDownResX.Size = new Size(180, 23);
        numericUpDownResX.TabIndex = 11;
        // 
        // labelResX
        // 
        labelResX.AutoSize = true;
        labelResX.Location = new Point(23, 150);
        labelResX.Name = "labelResX";
        labelResX.Size = new Size(44, 17);
        labelResX.TabIndex = 10;
        labelResX.Text = "Res X:";
        // 
        // textBoxModelName
        // 
        textBoxModelName.Location = new Point(94, 117);
        textBoxModelName.Name = "textBoxModelName";
        textBoxModelName.Size = new Size(180, 23);
        textBoxModelName.TabIndex = 9;
        // 
        // labelModel
        // 
        labelModel.AutoSize = true;
        labelModel.Location = new Point(23, 120);
        labelModel.Name = "labelModel";
        labelModel.Size = new Size(49, 17);
        labelModel.TabIndex = 8;
        labelModel.Text = "Model:";
        // 
        // checkBoxIsRunning
        // 
        checkBoxIsRunning.AutoSize = true;
        checkBoxIsRunning.Location = new Point(94, 90);
        checkBoxIsRunning.Name = "checkBoxIsRunning";
        checkBoxIsRunning.Size = new Size(88, 21);
        checkBoxIsRunning.TabIndex = 7;
        checkBoxIsRunning.Text = "Is Running";
        checkBoxIsRunning.UseVisualStyleBackColor = true;
        // 
        // numericUpDownGain
        // 
        numericUpDownGain.DecimalPlaces = 2;
        numericUpDownGain.Increment = new decimal(new int[] { 1, 0, 0, 65536 });
        numericUpDownGain.Location = new Point(94, 58);
        numericUpDownGain.Name = "numericUpDownGain";
        numericUpDownGain.Size = new Size(180, 23);
        numericUpDownGain.TabIndex = 6;
        // 
        // labelGain
        // 
        labelGain.AutoSize = true;
        labelGain.Location = new Point(23, 60);
        labelGain.Name = "labelGain";
        labelGain.Size = new Size(37, 17);
        labelGain.TabIndex = 5;
        labelGain.Text = "Gain:";
        // 
        // label1
        // 
        label1.AutoSize = true;
        label1.Location = new Point(23, 12);
        label1.Name = "label1";
        label1.Size = new Size(65, 17);
        label1.TabIndex = 1;
        label1.Text = "Exposure:";
        // 
        // trackBarExposure
        // 
        trackBarExposure.Location = new Point(94, 12);
        trackBarExposure.Maximum = 100;
        trackBarExposure.Name = "trackBarExposure";
        trackBarExposure.Size = new Size(134, 45);
        trackBarExposure.TabIndex = 0;
        trackBarExposure.Scroll += trackBarExposure_Scroll;
        // 
        // webView
        // 
        webView.AllowExternalDrop = true;
        webView.CreationProperties = null;
        webView.DefaultBackgroundColor = Color.White;
        webView.Dock = DockStyle.Fill;
        webView.Location = new Point(0, 0);
        webView.Name = "webView";
        webView.Size = new Size(500, 450);
        webView.TabIndex = 2;
        webView.ZoomFactor = 1D;
        // 
        // timer1
        // 
        timer1.Tick += timer1_Tick;
        // 
        // Form1
        // 
        AutoScaleDimensions = new SizeF(7F, 17F);
        AutoScaleMode = AutoScaleMode.Font;
        ClientSize = new Size(800, 450);
        Controls.Add(webView);
        Controls.Add(panel1);
        Name = "Form1";
        Text = "Form1";
        Load += Form1_Load;
        panel1.ResumeLayout(false);
        panel1.PerformLayout();
        ((System.ComponentModel.ISupportInitialize)numericUpDownResX).EndInit();
        ((System.ComponentModel.ISupportInitialize)numericUpDownGain).EndInit();
        ((System.ComponentModel.ISupportInitialize)trackBarExposure).EndInit();
        ((System.ComponentModel.ISupportInitialize)webView).EndInit();
        ResumeLayout(false);
    }

    #endregion

    private Panel panel1;
    private Microsoft.Web.WebView2.WinForms.WebView2 webView;
    private TrackBar trackBarExposure;
    private Label label1;
    private System.Windows.Forms.Timer timer1;
    private System.Windows.Forms.Button btnAddLog;
    private System.Windows.Forms.ListBox listBoxLogs;
    private System.Windows.Forms.NumericUpDown numericUpDownGain;
    private System.Windows.Forms.CheckBox checkBoxIsRunning;
    private System.Windows.Forms.TextBox textBoxModelName;
    private System.Windows.Forms.NumericUpDown numericUpDownResX;
    private System.Windows.Forms.Label labelGain;
    private System.Windows.Forms.Label labelModel;
    private System.Windows.Forms.Label labelResX;
}
