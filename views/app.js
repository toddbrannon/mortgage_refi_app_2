<%- include('partials/header', { title: 'Mortgage Calculator', activeTab: 'input' }) %>

<div class="container">
    <!-- Control buttons -->
    <div class="btn-group mt-3 mb-3">
        <button type="button" id="populateTestData" class="btn btn-secondary">Add Test Data</button>
        <button type="button" id="clearForm" class="btn btn-outline-secondary">Clear Form</button>
    </div>

    <!-- Tab Navigation -->
    <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item">
            <a class="nav-link active" data-bs-toggle="tab" href="#input">Input</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" data-bs-toggle="tab" href="#ifw_form">IFW</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" data-bs-toggle="tab" href="#refi_checker">REFI Checker</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" data-bs-toggle="tab" href="#payoff">Pay Off</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" data-bs-toggle="tab" href="#escrow">Escrow</a>
        </li>
    </ul>

    <!-- Tab Content Container -->
    <div class="tab-content">
        <!-- Content panes will go here -->
    </div>
</div>